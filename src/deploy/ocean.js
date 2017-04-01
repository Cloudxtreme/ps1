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

  destroyDrops(tag = '') {
    // promise to destroy all drops matching tag.
    // Annoyingly, the do_wrapper documentation is wrong for when no
    // tag is passed; only one droplet can then be deleted per call.
    const promises = [];
    return this.listOfDrops(tag).then((drops) => {
      for (let i = 0; i < drops.length; i += 1) {
        const idList = drops.map(drop => drop.id);
        promises.push(this.api.dropletsDelete([idList]));
      }
      return Promise.all(promises);
    });
  }
}

// function pCreateNewDroplet(api) {
//   // create a usual dropet, promise the response.
//   const spec = {
//     name: 'ps1',
//     region: 'sfo2',
//     size: '2gb',
//     image: 'ubuntu-16-10-x64', // 'ubuntu-16-10-x64',
//     ssh_keys: [7631551],
//     backups: false,
//     ipv6: true,
//     user_data: null,
//     private_networking: null,
//     volumes: null,
//     tags: [
//       'ps1',
//     ],
//   };
//
//   const p = api.dropletsCreate(spec).then((res) => {
//     console.log('Created.');
//     return res;
//   });
//   return p;
// }


// function p_dropDrops(id_list) {
//   return api.dropletsDelete([id_list]);
// }

// if (false) {
//   api.dropletsGetAll('', (err, res, body) => {
//     // console.log('res  = ', res);
//   if (err) {
//     console.log('err  = ', err);
//   }
//   if (yes_list && body) {
//     console.log('Received List of ', body.droplets.length, ' droplets');
//     for (let i = 0; i < body.droplets.length; i++) {
//       const drop = body.droplets[i];
//       console.log(`{i+1}. (${drop.networks.v4[0].ip_address}, ${drop.name}, ${drop.id})`);
//     }
//   }
//   const drop = res && res.body && res.body.droplets && res.body.droplets[0];
//   if (!drop || res.body.droplets.length != 1 || drop.networks.v4.length != 1) {
//     console.log('got something odd in drops.');
//     if (res && res.body.droplets && res.body.droplets.length === 0) {
//       console.log('ahh..  no droplets');
//     }
//   } else {
//     console.log(`drop is (${drop.networks.v4[0].ip_address}, ${drop.name}, ${drop.id})`);
//     if (yes_delete) {
//       api.dropletsDelete([drop.id], (drop_err, drop_res, drop_body) => {
//         if (drop_err) {
//           console.log('drop_err = ', drop_err);
//         }
//         console.log('-----');
//         console.log('dropped, response body is ', drop_res.body);
//         console.log('-----');
//       });
//     }
//   }
//   if (yes_create) {
//     p_createNewDroplet(api).then((res) => console.log(res.body));
//   } // if yes_create
// });
// }
