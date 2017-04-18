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

  async actionComplete(actionId) {
    // poll DigitalOcean until the given actionId is complete.
    // return true or throw an error
    const retryDelays = [3000, 9000, 12000, 14000, 16000];
    for (let i = 0; i < retryDelays.length; i += 1) {
      /*  eslint-disable no-await-in-loop */
      await wait(retryDelays[i]);
      const result = await this.api.accountGetAction(actionId);
      const status = _.get(result, 'action.status', 'not found');
      if (status === 'not found') {
        throw new Error(`DigitalOcean failed to return action status for ${actionId}:\n${result}`);
      } else if (status === 'completed') {
        return true;
      }
    }
    throw new Error(`DigitalOcean failed to complete action ${actionId}`);
  }

  async listDrops(tag = '') {
    // return array of droplet objects, as returned by DigitalOcean.
    const searchTerm = tag ? { tag_name: tag } : '';
    const result = await this.api.dropletsGetAll(searchTerm);
    const droplets = _.get(result, 'response.body.droplets');
    if (_.isUndefined(droplets)) {
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
    const moreLines = _.map(droplets, (drop) => {
      const ip = _.get(drop, 'networks.v4[0].ip_address', 'None');
      lines.push(`${drop.id}     ${_.padEnd(ip, 15)}  ${drop.name}`);
    });
    return (lines + moreLines).join('\n');
  }

  async destroyDrops(tag = '') {
    // promise to destroy all drops matching tag, waiting until action is done.
    // Annoyingly, the do_wrapper documentation is wrong for when no
    // tag is passed; only one droplet can then be deleted per call.
    const drops = await this.listDrops(tag);
    d('drops founds', drops);
    const promises = [];
    for (let i = 0; i < drops.length; i += 1) {
      promises.push(this.api.dropletsDelete([drops[i].id]));
    }
    const results = await Promise.all(promises);
    console.log('destroying list is', results);
    console.log('await actions');
    return drops.length;
  }

  destroyDrop(id) {
    // promise to destory one drop by id.
    return this.api.dropletsDelete([id]);
  }

  createDrop(tag, name) {
    // promise to create a drop; promise returns result from DO.
    if (!name || !tag) {
      return Promise.reject(new Error('Name and Tag are required.'));
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
    return this.api.dropletsCreate(spec);
  }
}
