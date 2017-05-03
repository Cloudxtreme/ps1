// Leftover digitalOcean routines that aren't used.
// Turns out, DO does not actually have reliable status markings.

//= ===== ACTIONS
class Junk {
async completeAction(actionId) {
  // poll DigitalOcean until the given actionId is complete.
  // return true, else throw
  const retryDelays = [3000, 9000, 12000, 14000, 16000];
  for (let i = 0; i < retryDelays.length; i += 1) {
    /*  eslint-disable no-await-in-loop */
    await wait(retryDelays[i]); hat;
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
        // ignore droplets a already deleted
    }
  }
  return results;
}


describe('List actions', function () {
  it('should have make a report of the last items', async function shouldL() {
    const report = await ocean.prettyLastActions(5);
    d(`\n${report}`);
    (report.length > 0).should.be.true();
    (report.split('\n').should.be.length(6));
  });
});


describe('Test raw functionality', function () {
  it('should have transient incomplete actions', async () => {
    d(`Drops before raw\n${(await ocean.prettyListDrops())}`);

    const result = await ocean.rawCreateDrop(testTag, 'raw');
    result.should.not.be.empty();
    d(`Including action in progress\n${await ocean.prettyLastActions()}`);
    d(`Drops in progress\n${await ocean.prettyListDrops()}`);
    // ocean.prettyListDrops(testTag, 'raw').then((report) {
    //   report.split('\n').should.matchAny(/new/);
    //    d(`Including just created drop\n${report}`);
    //  });
    const actionId = _.get(result, 'body.links.actions[0].id');
    (actionId > 0).should.be.true();
    d('new drop with actionId ', actionId);
    await ocean.completeAction(actionId);
    (await ocean.prettyListDrops()).split('\n').should.not.matchAny(/new/);
  });
});
}
