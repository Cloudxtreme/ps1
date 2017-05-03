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

  static formatPrettyListDrops(tag, name, droplets) {
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

  async prettyListDrops(tag = '', name = '') {
    // return string with pretty printed list of droplets
    const droplets = await this.listDrops(tag, name);
    return Ocean.formatPrettyListDrops(tag, name, droplets);
  }


  async destroyDrops(tag = '', name = '') {
    // destroy all drops matching tag, waiting, probably, until done.
    // returns number of drops destroyed.
    const drops = await this.listDrops(tag, name);
    const dropIds = _.map(drops, 'id');
    if (dropIds.length === 0) return 0;

    // So, digitalOcean has no return that a drop was actually deleted,
    // just returning a status code that is accepts the need to delete a drop.
    // My strategy is to ask each drop to be deleted, then wait until all are
    // are gone.
    for (let i = 0; i < dropIds.length; i += 1) {
      this.api.dropletsDelete(dropIds[i]);
    }
    const pollingWaits = [3000, 7000, 10000, 10000, 10000, 10000];
    for (let i = 0; i < pollingWaits.length; i += 1) {
      /* eslint-disable no-await-in-loop */
      await wait(pollingWaits[i]);
      const remainingDrops = await this.listDrops(tag, name);
      if (remainingDrops.length === 0) {
        return drops.length;
      }
    }
    throw new Error(`Unable to delete drops ${tag}:${name}`);
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
      // first test, did it return and did it have an ip address set up?
      const ip = listDropsResults[0].networks.v4[0].ip_address;
      // second test, can I SSH into it for a command?
      const ssh = new NodeSSH();
      await ssh.connect({ host: ip,
        username: 'root',
        privateKey: config.digitalOceanPrivkey,
        passphrase: config.digitalOceanPassPhrase });
      await ssh.execCommand('uname -a');
    } catch (err) {
      // console.log('err is ', err);
      return false;
    }
    return true;
  }

  async createDrop(tag, name) {
      // create a drop, if needed, waiting until creation is complete.
      // May take around 30 seconds.
      // returns true or throws
    d(`creating drop ${tag}-${name}`);
    // First, if drop is up and running, just return the dropletId.
    if (this.isDropReady(tag, name)) {
      return true;
    }
    const result = await this.rawCreateDrop(tag, name);
    const dropletId = _.get(result, 'body.droplet.id');
    const pollingWaits = [3000, 7000, 10000, 10000, 10000, 10000];

    for (let i = 0; i < pollingWaits.length; i += 1) {
      /* eslint-disable no-await-in-loop */
      await wait(pollingWaits[i]);
      if (await this.isDropReady(tag, name)) {
        return true;
      }
    }
    throw new Error('Unable to create drop');
  }
}
