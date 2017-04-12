/* ocean.js -- My wrapper for DigitalOcean (DO) calls */
import DO from 'do-wrapper';
import _ from 'lodash';
import 'source-map-support/register';   // hack for sourcemaps
import config from '../../private_config';
import d from '../logging';
import { line, poll } from '../junkDrawer';
import { pro } from '../prolog';

export default class Ocean {
  constructor() {
    this.api = new DO(config.digitalOceanAPI, 99);
  }

  allActionsComplete(toCheck = 5) {
    // delay promise chain until DigitalOcean reports that last
    // actions are complete.   This does require polling DigitalOcean.
    const that = this;  // thought we over this hack.

    function getPagesOfActions(totalActions) {
      // return promise of getting all DO action pages needed to
      // check the last `toCheck` actions out of a total `totalActions`
      //
      // Math attack to get right pages to grab from digitalOcean.
      // let P = number of actions per perPage,
      // let T = total actions
      // let C = number of actions to check.
      // let F = first action to check, = T - C + 1
      // Results on page n, given P. range from (n-1)*P + 1 to last one at
      //    n*P
      // So pages needed are first page [ceil (F/P)]
      //  to last page ceil(T/P).
      // E.g., (C,P,T) = (5, 10, 17) => page 2 only, having actions 13 to 17
      // or = (14, 10, 161) => pages ceil((T-C+1)/P) to ceil(T/P)
      //    = ceil((161-14+1)/10) to ceil(161/10) = ceil(14.8) to ceil(16.1)
      //    = pages 15 to 17 will have actions including the last 14.

      if (!totalActions) return new Error("Can't find number of actions.");

      const perPage = 25; // DigitalOcean has hard limit of 200.
      const promises = [];
      for (let i = Math.ceil(((totalActions - toCheck) + 1) / perPage);
          i <= Math.ceil(totalActions / perPage); i += 1) {
        const p = that.api.accountGetActions({ perPage, pageNumber: i });
        promises.push(p);
      }
      return Promise.all(promises);
    }

    this.api.accountGetActions({ per_page: 1 })  // get first action
    .then(res => _.get(res, 'meta.total'))     // find number of actions from meta
    .then(getPagesOfActions)
    .then((res) => {
      d('got pages back');
      console.dir(res);
    })
    .catch(err => console.error(err));
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
      return _.get(result, 'body.action.status') === 'completed';
    }

    function getActionId(result) {
      // return actionId or Error from a result body.
      const actions = _.get(result, 'body.links.actions');
      if (!actions) return new Error('No .actions found.');
      if (actions.length !== 1) return new Error('.actions length was not 1');
      const actionId = _.get(actions, '[0].id');
      if (!actionId) return new Error('No actionId found');
      return actionId;
    }

    const retryDelays = [3000, 9000, 12000, 14000];
    let aResult;
    d(line('-'));
    return aPromise
      .then((result) => { aResult = result; return getActionId(result); })
      .then((actionId) => {
        poll(
          retryDelays,
          "Action requested, but DigitalOcean did mark as 'complete'",
          () => this.api.accountGetAction(actionId),
          isActionDone);
      })
      .then(() => aResult)
      .catch((err) => { d('error ', err); return err; });
  }

  listOfDrops(tag = '') {
    // promise array of droplets, objects as returned by DigitalOcean.
    const searchTerm = tag ? { tag_name: tag } : '';

    const p = this.api.dropletsGetAll(searchTerm).then(res => res.body.droplets);
    return p;
  }

  static prettyDrops(drops) {
    // return string of pretty printed list of drops
    // TODO:  sub in 'not completed' for errors?
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

function foo() {
  // testing code.
  console.log('starting');
  const ocean = new Ocean();
  const p1 = pro(ocean.createDrop('random', 'junk'));
  p1.catch(() => console.log('meh.'));
  const p2 = ocean.complete(p1, 3);
  p2.then((val) => {
    d('foo: create/complete resolved with'); console.dir(val);
    ocean.prettyListOfDrops().then(res => console.log(res));
  })
  .catch(
    (err) => { d('foo: create/complete rejected with ', err); },
  );
  line('.');
  const p3 = p2.then(() => ocean.destroyDrops());
  const p4 = p3.then(ocean.allActionsComplete);
  p4.then(v => console.log('v = ', v))
  .catch(e => console.error('foo: allActionsComplete err = ', e));

  p1.then((res) => { d('original drop was '); console.dir(res); });
  d('This program is gratified to be of use.');
}

// if (require.main === 'module') {   // note this breaks for debugger
// foo();
