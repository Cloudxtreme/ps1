import config from '../private_config';
import DO from 'do-wrapper';

const spec = {
  name: 'ps1',
  region: 'sfo2',
  size: '2gb',
  image: 'ubuntu-16-10-x64', // 'ubuntu-16-10-x64',
  ssh_keys: [7631551],
  backups: false,
  ipv6: true,
  user_data: null,
  private_networking: null,
  volumes: null,
  tags: [
    'ps1',
  ],
};

const yes_list = true;
const yes_delete = true;
const yes_create = true;
const api = new DO(config.digital_ocean_api, 99);

console.log('==================');
console.log('==================');
console.log('==================');
console.log('==================');
console.log('==================');

api.dropletsGetAll('', (err, res, body) => {
    // console.log('res  = ', res);
  if (err) {
    console.log('err  = ', err);
  }
  if (yes_list && body) {
    console.log('Received List of ', body.droplets.length, ' droplets');
    for (let i = 0; i < body.droplets.length; i++) {
      const drop = body.droplets[i];
      console.log(`{i+1}. (${drop.networks.v4[0].ip_address}, ${drop.name}, ${drop.id})`);
    }
  }
  const drop = res && res.body && res.body.droplets && res.body.droplets[0];
  if (!drop || res.body.droplets.length != 1 || drop.networks.v4.length != 1) {
    console.log('got something odd in drops.');
    if (res && res.body.droplets && res.body.droplets.length === 0) {
      console.log('ahh..  no droplets');
    }
  } else {
    console.log(`drop is (${drop.networks.v4[0].ip_address}, ${drop.name}, ${drop.id})`);
    if (yes_delete) {
      api.dropletsDelete([drop.id], (drop_err, drop_res, drop_body) => {
        if (drop_err) {
          console.log('drop_err = ', drop_err);
        }
        console.log('-----');
        console.log('dropped, response body is ', drop_res.body);
        console.log('-----');
      });
    }
  }
  if (yes_create) {
    api.dropletsCreate(spec, (create_err, create_res, create_body) => {
      if (create_err) {
        console.log('create_err =', create_err);
      }
      console.log('-----');
      console.log('create_res body = ', create_res.body);
      console.log('-----');
    });
  } // if yes_create
});
