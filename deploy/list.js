import config from '../private_config';
import DO from 'do-wrapper';

const api = new DO(config.digital_ocean_api, 99);

api.dropletsGetAll('', (err, res, body) => {
  // console.log('res  = ', res);
  console.log('err  = ', err);
  const drop = res && res.body && res.body.droplets && res.body.droplets[0];
  if (!drop || res.body.droplets.length != 1 || drop.networks.v4.length != 1) {
    console.log('got something odd in drops.');
  } else {
    console.log(`drop is (${drop.networks.v4[0].ip_address}, ${drop.name}, ${drop.id})`);
  }
});
