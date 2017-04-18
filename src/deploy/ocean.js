/* ocean.js -- My wrapper for DigitalOcean (DO) calls */
import DO from 'do-wrapper';
import _ from 'lodash';
// import console from 'better-console';
import 'source-map-support/register';   // hack for sourcemaps
import config from '../../private_config';
import { d, ddir } from '../logging';
import { wait } from '../junkDrawer';

export default class Ocean {
  constructor() {
    this.api = new DO(config.digitalOceanAPI, 99);
  }

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
      ddir('checking droplet', result.body);
      if (_.get(result, 'body.droplet.status') === 'active') {
        return true;
      }
    }
    throw new Error(`DigitalOcean failed to complete droplet ${dropletId}`);
  }


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
        ddir('passing action has this body', result.body);
        if (action.type === 'create' &&
            action.resource_type === 'droplet') {
          await this.completeCreateDrop(action.resource_id);
        }
        return true;
      }
    }
    throw new Error(`DigitalOcean failed to complete action ${actionId}`);
  }

  async lastActionIds(number = 2) {
    // return array of last actions

    // first, find the last action
    const result = await this.api.accountGetActions({ per_page: 1, page_number: 250 });
    const lastLine = _.get(result, 'body.links.pages.last');
    const lastAction = parseInt(lastLine.match(/page=(.*)&per_page/)[1], 10);

    // be subtle later...
    const promises = [];
    for (let i = (lastAction - number) + 1; i <= lastAction; i += 1) {
      promises.push(this.api.accountGetActions({ per_page: 1, page_number: i }));
    }
    const results = await Promise.all(promises);
    const actions = [];
    for (let i = 0; i < results.length; i += 1) {  // yeah, yeah use filter
      actions.push(_.get(results, `[${i}].body.actions[0]`));
    }

    d('actions: ', actions);
    return actions;
  }

  async listDrops(tag = '') {
    // return array of droplet objects, as returned by DigitalOcean.
    const searchTerm = tag ? { tag_name: tag } : '';
    const result = await this.api.dropletsGetAll(searchTerm);
    const droplets = _.get(result, 'response.body.droplets');
    if (_.isUndefined(droplets)) {
      ddir('failed to get droplets field', result);
      throw new Error(`DigitalOcean result failed to return a droplets field:\n ${result}`);
    }
    return droplets;
  }

  async prettyListDrops(tag = '') {
    // return string with pretty printed list of droplets
    const droplets = await this.listDrops(tag);
    if (droplets.length === 0) {
      return 'No drops found';
    }
    const lines = ['Id           IP Address       Name'];
    for (let i = 0; i < droplets.length; i += 1) {
      const drop = droplets[i];
      const ip = _.get(drop, 'networks.v4[0].ip_address', 'None');
      lines.push(`${drop.id}     ${_.padEnd(ip, 15)}  ${drop.name}  ${drop.status}`);
    }
    const out = (lines).join('\n');
    return out;
  }

  async destroyDrops(tag = '') {
    // destroy all drops matching tag, waiting until action is done.
    // Annoyingly, the do_wrapper documentation is wrong for when no
    // tag is passed; only one droplet can then be deleted per call.
    // returns number of drops destroyed.
    // Note that DigitalOcean doesn't return the actionIDs, just a
    // status 204 to note that is accepted the request.
    const drops = await this.listDrops(tag);
    if (drops.length === 0) {
      return 0;
    }
    d('drops found:', drops);
    const promises = [];
    for (let i = 0; i < drops.length; i += 1) {
      promises.push(this.api.dropletsDelete([drops[i].id]));
    }
    const results = await Promise.all(promises);
    const status = _.get(results, '[0].response.IncomingMessage.statusCode');
    if (status !== 204) {
      ddir('Did not get status 204 from DO.', results);
    }
    d('await actions');
    const actions = await this.listIncomplete();
    d('incomplete actions = ', actions);
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

  async createDrop(tag, name) {
      // create a drop, waiting until creation is complete.
      // May take a while, like 30 seconds.
    const result = await this.rawCreateDrop(tag, name);
    const actionId = _.get(result, 'body.links.actions[0].id');
    const dropletId = _.get(result, 'body.droplet.id');
    d('action id is', actionId);
    await this.complete(actionId);
    return dropletId;
  }
}
