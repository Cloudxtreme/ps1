// Launch a new running server.
// This tends be sequential, and a bit monolithic, as fits the problem.
// The output is chatty, as befits the use case.

import assert from 'assert';  // sanity checks, even in running code
import chalk from 'chalk';
import rp from 'request-promise-native';
import NodeSSH from 'node-ssh';
import Ocean from './ocean';
import { d, ddir } from '../logging';
import config from '../../private_config';
import { wait } from '../junkDrawer';

const ocean = new Ocean();
const tag = 'stage';
const name = 'toy';


function getIPFromResults(listDropsResults) {
  // get IP of the staging drop, or throw.
  const ip = listDropsResults[0].networks.v4[0].ip_address;
  return ip;
}

async function createStagingDrop() {
  await ocean.destroyDrops(tag);
  await ocean.createDrop(tag, name);
  return true;
}

async function getStagingIP() {
  // if I can't get the staging drop IP, kill it and make a new one,
  // if I still can't make it, throw.
  let ip;
  try {
    const res = await ocean.listDrops(tag, name);
    ip = getIPFromResults(res);
  } catch (e) {
    await createStagingDrop();
    const res = await ocean.listDrops(tag, name);
    ip = getIPFromResults(res);
  }
  assert(ip, 'Cannot get IP from staging server');
  return ip;
}

async function getStagingSSH(ip, userName) {
  // return SSH handle for a new or existing server
  // So, should this actually make a connection to see that it worked?
  const ssh = new NodeSSH();
  await ssh.connect({ host: ip,
    username: userName,
    privateKey: config.digitalOceanPrivkey,
    passphrase: config.digitalOceanPassPhrase });
  assert(ssh, `Cannot get staging server SSH for ${userName}@${ip}`);
  return ssh;
}

async function executeCommands(ssh, cmds) {
  // execute array of commands on given ssh, with nice output.
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < cmds.length; i += 1) {
    const cmd = cmds[i].trim();
    console.log(`${chalk.cyan('Cmd:')}\t\t\t|${chalk.black(cmd)}`);
    const o = await ssh.execCommand(cmd);
    const out = o.stdout.split('\n').join('\n\t\t\t|');
    const err = `  ${chalk.cyan('stderr:')}\t\t|${o.stderr.split('\n').join('\n\t\t\t|')}`;
    console.log(`  ${chalk.cyan('stdout:')}\t\t|${chalk.magenta(out)}\n${o.stderr ? chalk.red(err) : ''}`);
  }
}


function getScripts(userName) {
  // return scripts { asRoot, asUser } each as arrays of lines of command.
  // takes userName setting because it used in making the ssh key as well.
  const nodeVersion = '7.x';
  const installPackages = `
  # Add yarn repo
  apt-get install curl
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  curl -sL https://deb.nodesource.com/setup_${nodeVersion} | bash -
  apt-get update

  apt-get -y install curl git
  apt-get -y install nodejs
  apt-get -y install yarn
  `;
  const redirectPort80 = `
  iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
  `;

  const userDir = `/home/${userName}`;
  const createUser = `
  adduser --disabled-password --gecos "" ${userName}
  mkdir ${userDir}/.ssh
  cp .ssh/authorized_keys ${userDir}/.ssh
  chown ps1 /home/ps1/.ssh /home/ps1/.ssh/authorized_keys
  `;

  const repoName = 'ps1';
  const repo = `https://github.com/merriam/${repoName}.git`;
  const userInstall = `
  node --version
  git clone ${repo}
  cd ${userDir}/${repoName}; pwd; yarn
  `;

  const userStartServer = `
  cd ${userDir}/${repoName}; nohup yarn start:prod > prod.out 2> prod.err < /dev/null &
  `;

  let asRoot = ['uname -a', 'whoami', installPackages, redirectPort80, createUser];
  asRoot = asRoot.join('\n').split('\n').filter(x => x.trim());
  // make an array of individual, nonblank lines
  let asUser = ['pwd', 'whoami', userInstall, userStartServer];
  asUser = asUser.join('\n').split('\n').filter(x => x.trim());
  // make an array of individual, nonblank lines

  return { asRoot, asUser };
}

function doesPageHaveTitle(html) {
  return !!html.match(/The Bash Prompt/gm);
}

async function checkMainPageTitle(ip) {
  // check that port 80 provides something.
  const html = await rp.get(`http://${ip}`);
  d('html', html);
  return doesPageHaveTitle(html);
}

async function waitForServiceToStart(ip) {
  for (let i = 0; i < 10; i += 1) {
    if (await checkMainPageTitle(ip)) {
      return true;
    }
    await wait(1000);
  }
  throw new Error('Web service did not start');
}

async function launchService() {
  // launch the service on a new or existing staging drop.  returns ip.
  const userName = 'ps1';

  d('Checkpoint 1 - starting foo');

  const ip = await getStagingIP();

  d(`Current drops are:\n${await ocean.prettyListDrops()}`);

  d(`Checkpoint 2 - ip ${ip} obtained`);
  const scripts = getScripts(userName);

  const rootSSH = await getStagingSSH(ip, 'root');
  await executeCommands(rootSSH, scripts.asRoot);
  rootSSH.dispose();
  d('Checkpoint 3 - root commands done');

  const ps1SSH = await getStagingSSH(ip, userName);
  await executeCommands(ps1SSH, scripts.asUser);
  ps1SSH.dispose();
  d('checkpoint 4 - user commands run');

  await waitForServiceToStart();
  return ip;
}

// ----- Tests ----------

const listDropsResults = [{ id: 46796470, name: 'toy', memory: 2048, vcpus: 2, disk: 40, locked: false, status: 'active', kernel: null, created_at: '2017-04-24T21:00:09Z', features: ['ipv6'], backup_ids: [], next_backup_window: null, snapshot_ids: [], image: { id: 23755412, name: '16.10 x64', distribution: 'Ubuntu', slug: 'ubuntu-16-10-x64', public: true, regions: ['nyc1', 'sfo1', 'nyc2', 'ams2', 'sgp1', 'lon1', 'nyc3', 'ams3', 'fra1', 'tor1', 'sfo2', 'blr1'], created_at: '2017-03-27T15:39:10Z', min_disk_size: 20, type: 'snapshot', size_gigabytes: 0.35 }, volume_ids: [], size: { slug: '2gb', memory: 2048, vcpus: 2, disk: 40, transfer: 3, price_monthly: 20, price_hourly: 0.02976, regions: ['ams1', 'ams2', 'ams3', 'blr1', 'fra1', 'lon1', 'nyc1', 'nyc2', 'nyc3', 'sfo1', 'sfo2', 'sgp1', 'tor1'], available: true }, size_slug: '2gb', networks: { v4: [{ ip_address: '138.68.3.236', netmask: '255.255.240.0', gateway: '138.68.0.1', type: 'public' }], v6: [{ ip_address: '2604:A880:0002:00D0:0000:0000:1F68:9001', netmask: 64, gateway: '2604:a880:0002:00d0:0000:0000:0000:0001', type: 'public' }] }, region: { name: 'San Francisco 2', slug: 'sfo2', sizes: ['512mb', '1gb', '2gb', '4gb', '8gb', '16gb', '32gb', '48gb', '64gb'], features: ['private_networking', 'backups', 'ipv6', 'metadata', 'install_agent', 'storage'], available: true }, tags: ['stage'] }];
const listDropsNothingFoundResult = [];

function itShouldGetTheIPAddress() {
  const expected = '138.68.3.236';
  const actual = getIPFromResults(listDropsResults);
  assert.equal(actual, expected);
}

function itShouldThrowOnBadResult() {
  assert.throws(() => getIPFromResults(listDropsNothingFoundResult));
}

function itShouldFindTheTitle() {
  const goodHTML = `<!doctype html public "storage">
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta charset=utf-8/>
<title>PS1 - The Bash Prompt</title>
<link rel="stylesheet" href="/index.css" /> <!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<!-- jQuery library -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<!-- Latest compiled JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

</head>
<div id=app></div>
<script src="/bundle.js"></script>`;
  assert.equal(true, doesPageHaveTitle(goodHTML));
}

function itShouldFailTitleFindOnEmpty() {
  const badHTML = '';
  assert.equal(false, doesPageHaveTitle(badHTML));
}

itShouldFindTheTitle();
itShouldFailTitleFindOnEmpty();

itShouldGetTheIPAddress();
itShouldThrowOnBadResult();


launchService()
.then(ip => wait(2000, ip))
.then(ip => checkMainPageTitle(ip))
.then(() => console.log('Test Passed!'))
.catch(err => console.log('Not so much...', err));

d('99.   This program is gratified to be of use.');
