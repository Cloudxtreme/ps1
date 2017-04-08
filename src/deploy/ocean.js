/* ocean.js -- My wrapper for DigitalOcean (DO) calls */
import DO from 'do-wrapper';
import _ from 'lodash';
import console from 'better-console';
import 'source-map-support/register';
import config from '../../private_config';
import d from '../logging';
import line from '../junkDrawer';

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

  complete(aPromise) {
    // delay promise chain until DigitalOcean's action is marked
    // completed.  This does require actively polling DigitalOcean.
    //
    // reject if:
    //     no ActionId,
    //     more than one action in action list
    //     all polling attempts fail to receive 'completed' status.
    // other fulfill with the original result passed to it.

    function isActionDone(result) {
      const status = _.get(result, 'body.action.status');
      const complete = status === 'completed';
      d('Action status returned ', status, ' or ', complete);
      return complete;
    }

    function getActionId(result) {
      // return actionId or Error from a result body.
      const actions = _.get(result, 'body.links.actions');
      if (!actions) {
        d("Can't find links.actions");
        // console.dir(result);
        return new Error('No .links found.');
      }
      if (actions.length !== 1) {
        d('links.actions wrong length');
        console.dir(result);
        return new Error('.links.actions was not length 1');
      }
      const actionId = _.get(actions, '[0].id');
      if (!actionId) {
        d('No action id.');
        console.dir(result);
        return new Error('No actionId found');
      }
      d('actionId = ', actionId);
      return actionId;
    }

    const retryDelays = [1000, 3000, 2000];
    debugger;

    d(line('-'));
    d('aPromise = ', aPromise);
    d('retryDelays = ', retryDelays);
    let theResult;
    return aPromise
      .then((result) => { theResult = result; return getActionId(result); })
      .then((actionId) => {
        poll(
          [1000, 1000, 1000, 1000, 1000, 1000],
          "Action requested, but DigitalOcean did mark as 'complete'",
          () => this.api.accountGetAction(actionId),
          isActionDone);
      })
      .then(() => theResult)
      .catch((err) => { d('error ', err); return err; });
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

function poll(retryDelays, errorMessage, polledPromise, isDoneFn) {
  // isDoneFn returns true if done or false if more polling needed
  // polledPromise resolves to a value passed to the isDoneFn
  // Fulfills with result from polledPromise or
  // Rejects if out of polling times or polledPromise rejects.

  function wait(delayMs, value) {
    // promise fulfills with value after delay time (in milliseconds)
    return new Promise((resolve) => {
      d('setting timeout');
      setTimeout(() => resolve(value), delayMs);
    });
  }

  function recursivePoll() {
    d('In recursivePoll:');
    const delay = retryDelays.shift();
    d('   delay: ', delay);
    if (_.isUndefined(delay)) {
      return Error(errorMessage);
    }
    return wait(delay)
      .then(polledPromise)
      .then((result) => {
        if (isDoneFn(result)) {
          return result;
        }
        return recursivePoll();
      });
  }

  d('In poll:');
  d('   retryDelays: ', retryDelays);
  return recursivePoll();
}

if (true || require.main === 'module') {
  //-----
  console.log('starting');
  const ocean = new Ocean();
  const p1 = ocean.createDrop('random', 'junk');
  const p2 = ocean.complete(p1, 3);
  line('.');

  p2.then(
    (val) => { d('resolved with'); console.dir(val); })
  .catch(
    (err) => { d('rejected with ', err); },
  );

  p1.then((res) => { d('original drop was '); console.dir(res); });
  d('This program is gratified to be of use.');
  console.trace();
}
