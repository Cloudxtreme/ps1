import DO from 'do-wrapper';
import _ from 'lodash';
import config from '../../private_config';

export default class Ocean {
  constructor() {
    this.api = new DO(config.digitalOceanAPI, 99);
  }

  listOfDrops(tag = '') {
    // promise array of droplets, objects as returned by DigitalOcean.
    const searchTerm = tag ? { tag_name: tag } : '';

    const p = this.api.dropletsGetAll(searchTerm).then(res => res.body.droplets);
    return p;
  }

  static prettyDrops(drops) {
    // return string of pretty printed list of drops
    const count = drops.length;
    if (count) {
      const lines = ['Id           IP Address       Name'];
      for (let i = 0; i < drops.length; i += 1) {
        const drop = drops[i];
        const ip = _.get(drop, 'networks.v4[0].ip_address', 'None');
        lines.push(`${drop.id}     ${_.padEnd(ip, 15)}  ${drop.name}`);
      }
      return lines.join('\n');
    }
    return 'No drops found.';
  }

  prettyListOfDrops(tag = '') {
    // promise a multiline string of the list of drops.
    return this.listOfDrops(tag).then(drops => Ocean.prettyDrops(drops));
  }

  destroyDrops(tag = '') {
    // promise to destroy all drops matching tag.
    // Annoyingly, the do_wrapper documentation is wrong for when no
    // tag is passed; only one droplet can then be deleted per call.
    const promises = [];
    return this.listOfDrops(tag).then((drops) => {
      for (let i = 0; i < drops.length; i += 1) {
        const drop = drops[i];
        promises.push(this.api.dropletsDelete([drop.id]));
      }
      return Promise.all(promises);
    });
  }

  destroyDrop(id) {
    // promise to destory one drop by id.
    return this.api.dropletsDelete([id]);
  }

  createDrop(name, tag) {
    // promise to create a drop.
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
