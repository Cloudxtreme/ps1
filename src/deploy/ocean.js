/* ocean.js -- My wrapper for DigitalOcean (DO) calls */
import DO from 'do-wrapper';
import _ from 'lodash';
import NodeSSH from 'node-ssh';
// import 'source-map-support/register';   // hack for sourcemaps
import config from '../../private_config';
import { d, ddir } from '../logging';
import { wait } from '../junkDrawer';

export default class Ocean {
  constructor() {
    this.api = new DO(config.digitalOceanAPI, 99);
  }

  //= ===== ACTIONS
  async completeAction(actionId) {
    // poll DigitalOcean until the given actionId is complete.
    // return true, else throw
    const retryDelays = [3000, 9000, 12000, 14000, 16000];
    for (let i = 0; i < retryDelays.length; i += 1) {
      /*  eslint-disable no-await-in-loop */
      await wait(retryDelays[i]);
      const result = await this.api.accountGetAction(actionId);
      d('.... polled action');
      const action = _.get(result, 'body.action');
      const status = _.get(action, 'status');
      if (!status) {
        ddir('could not found action.status', result);
        throw new Error(`DigitalOcean failed to return action status for ${actionId}`);
      } else if (status === 'completed') {
        if (action.type === 'create' &&
            action.resource_type === 'droplet') {
          await this.completeCreateDrop(action.resource_id);
        }
        return true;
      }
    }
    throw new Error(`DigitalOcean failed to complete action ${actionId}`);
  }

  async lastActions(number = 2) {
    // return array of last actions
    // first, find the last action
    const result = await this.api.accountGetActions({ per_page: 1, page: 1 });
    const lastLine = _.get(result, 'body.links.pages.last');
    const lastAction = parseInt(lastLine.match(/page=(.*)&per_page/)[1], 10);

    // be efficient later...  either promises or pages
    const actions = [];
    for (let i = (lastAction - number) + 1; i <= lastAction; i += 1) {
      try {
        const response = await this.api.accountGetActions({ per_page: 1, page: i });
        actions.push(response.body.actions[0]);
      } catch (err) {
        if (!err.message.match(/The resource you were accessing could not be found./)) {
          throw err;
        }
      }
    }
    return actions;
  }

  async prettyLastActions(number = 2) {
    const actions = await this.lastActions(number);
    const lines = ['actionID    status       type            droplet_id'];
    for (let i = 0; i < actions.length; i += 1) {
      const action = actions[i];
      let dStatus = '';
      let dId = '';
      // fill in droplet status
      if (action.resource_type === 'droplet') {
        dId = action.resource_id;
        try {
          const result = await this.api.dropletsGetById(dId);
          dStatus = _.get(result, 'body.droplet.status');
        } catch (err) {
          if (!err.message.match(/The resource you were accessing could not be found./)) {
            throw err;
          }
          // ignore missing droplet, e.g., deleted.
        }
      }
      lines.push(`${action.id}   ${_.padEnd(action.status, 12)} ${_.padEnd(action.type, 15)} ${dId}  ${dStatus}`);
    }
    const out = (lines).join('\n');
    return out;
  }


  //= ===== REPORTING

  //= ===== CREATE

  async completeCreateDrop(dropletId) {
    // poll DigitalOcean until the given dropletId creation is complete.
    // return true, else throw
    d('completing drop', dropletId);
    const retryDelays = [3000, 9000, 12000, 14000, 16000];
    for (let i = 0; i < retryDelays.length; i += 1) {
      /*  eslint-disable no-await-in-loop */
      await wait(retryDelays[i]);
      const result = await this.api.dropletsGetById(dropletId);
      d('.... polled droplet');
      if (_.get(result, 'body.droplet.status') === 'active') {
        await wait(25000);  // give DigitalOcean additional time to set up networks and SSH daemon
        // maybe run a smoke on the machine here?
        return true;
      }
    }
    throw new Error(`DigitalOcean failed to complete droplet ${dropletId}`);
  }


  async listDrops(tag = '', name = '') {
    // return array of droplet objects, as returned by DigitalOcean.
    const searchTerm = tag ? { tag_name: tag } : '';
    const result = await this.api.dropletsGetAll(searchTerm);
    let droplets = _.get(result, 'response.body.droplets');
    if (_.isUndefined(droplets)) {
      ddir('failed to get droplets field', result);
      throw new Error(`DigitalOcean result failed to return a droplets field:\n ${result}`);
    }
    if (name) {
      droplets = _.filter(droplets, drop => drop.name === name);
    }
    return droplets;
  }

  async prettyListDrops(tag = '', name = '') {
    // return string with pretty printed list of droplets
    const droplets = await this.listDrops(tag, name);
    if (droplets.length === 0) {
      return 'No drops found';
    }
    const lines = ['Id           IP Address       Tag        Name'];
    for (let i = 0; i < droplets.length; i += 1) {
      const drop = droplets[i];
      const ip = _.get(drop, 'networks.v4[0].ip_address', 'None');
      const tags = drop.tags.join(', ');
      const status = drop.status === 'active' ? '' : drop.status;
      lines.push(`${drop.id}     ${_.padEnd(ip, 15)}  ${_.padEnd(tags, 10)} ${_.padEnd(drop.name, 10)}  ${status}`);
    }
    const out = (lines).join('\n');
    return out;
  }

  async rawDestroyDrops(dropIds) {
    // promise to destroy a drops given dropIds.
    // Note that DigitalOcean doesn't return the actionIDs, just a
    // status 204 to note that is accepted the request.
    // Note that 'machine already gone' type errors happen in testing, so
    // no promise.all..
    const results = [];
    for (let i = 0; i < dropIds.length; i += 1) {
      try {
        const result = await this.api.dropletsDelete(dropIds[i]);
        results.push(result);
      } catch (err) {
        if (!err.message.match(/The resource you were accessing could not be found/)) {
          throw err;
        }
          // ignore droplets a dlready deleted
      }
    }
    return results;
  }

  async destroyDrops(tag = '', name = '') {
    // destroy all drops matching tag, waiting, probably, until done.
    // returns number of drops destroyed.
    const drops = await this.listDrops(tag, name);
    const dropIds = _.map(drops, 'id');
    if (dropIds.length === 0) return 0;
    await this.rawDestroyDrops(dropIds);
    await wait(20000);  // stupid @#$@# ocean
    return drops.length;
  }

  rawCreateDrop(tag, name) {
    // promise to create a drop, returning immediately
    if (!name || !tag) {
      throw new Error('Name and Tag are required.');
    }
    const spec = {
      name,
      region: 'sfo2',
      size: '2gb',
      image: 'ubuntu-16-10-x64', // 'ubuntu-16-10-x64',
      ssh_keys: [config.digitalOceanPubkeyId],
      backups: false,
      ipv6: true,
      user_data: null,
      private_networking: null,
      volumes: null,
      tags: [tag],
    };
    const p = this.api.dropletsCreate(spec);
    return p;
  }

  async isDropReady(tag, name) {
    try {
      const listDropsResults = await this.listDrops(tag, name);
      ddir('listdropsres =', listDropsResults);
      const ip = listDropsResults[0].networks.v4[0].ip_address;
      d('ip');
      const ssh = new NodeSSH();
      await ssh.connect({ host: ip,
        username: 'root',
        privateKey: config.digitalOceanPrivkey,
        passphrase: config.digitalOceanPassPhrase });
      d('ssh1');
      await ssh.execCommand('uname -a');
      d('ssh2');
    } catch (err) {
      d(`creation error ${err}, waiting`);
      return false;
    }
    return true;
  }

  async createDrop(tag, name) {
      // create a drop, waiting until creation is complete.
      // May take a while, like 30 seconds.
      // returns the dropletId for the new droplet.
    d(`creating drop ${tag}-${name}`);
    const result = await this.rawCreateDrop(tag, name);
    const dropletId = _.get(result, 'body.droplet.id');

    for (;;) {
      await wait(5000);
      if (await this.isDropReady(tag, name)) {
        d('ready');
        break;
      }
    }
    return dropletId;
  }
}
