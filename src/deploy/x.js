// because of node debugger problems
// make 'tests' run then transfer.
import assert from 'assert';
import chalk from 'chalk';
import NodeSSH from 'node-ssh';
import http from 'http';
import Ocean from './ocean';
import { d, ddir } from '../logging';
// import { wait } from '../junkDrawer';
import config from '../../private_config';

const ocean = new Ocean();
const tag = 'stage';
const name = 'toy';


function getIPFromResults(listDropsResults) {
  // get IP of the staging drop, or throw.
  // const res = await ocean.listDrops(tag, name);
  const ip = listDropsResults[0].networks.v4[0].ip_address;
  return ip;
}

async function createStagingDrop() {
  await ocean.destroyDrops(tag);
  const drop = await ocean.createDrop(tag, name);
  return true;
}

async function getStagingIP() {
  let ip;
  try {
    const res = await ocean.listDrops(tag, name);
    ip = getIPFromResults(res);
  } catch (e) {
    await createStagingDrop();
    const res = await ocean.listDrops(tag, name);
    ip = getIPFromResults(res);
  }
  return ip;
}

async function getStagingSSH(ip, userName) {
  // return SSH handle for a new or existing server
  const ssh = new NodeSSH();
  await ssh.connect({ host: ip,
    username: userName,
    privateKey: config.digitalOceanPrivkey,
    passphrase: config.digitalOceanPassPhrase });
  // check ssh worked?
  return ssh;
}

async function executeCommands(ssh, cmds) {
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

async function foo() {
  d('Checkpoint 1 - starting foo');
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

  const userName = 'ps1';
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

  const ip = await getStagingIP();

  d(`Current drops are:\n${await ocean.prettyListDrops()}`);

  d(`Checkpoint 2 - ip ${ip} obtained`);

  const rootSSH = await getStagingSSH(ip, 'root');

  await executeCommands(rootSSH, asRoot);
  rootSSH.dispose();
  d('Checkpoint 3 - root commands done');

  const ps1SSH = await getStagingSSH(ip, userName);
  await executeCommands(ps1SSH, asUser);
  ps1SSH.dispose();
  d('checkpoint 4 - user commands run');
  const address = `http://${ip}:80`;
  d(address);

  http.get(`http://${ip}:80`, (res) => {
    d(`status is ${res.statusCode} - ${res.statusName}`);
    let body = '';
    res.on('data', (data) => { body += data; });
    res.on('end', () => {
      console.log('body = ', body);
      if (body.match(/The Bash Prompt/gm)) {
        console.log('TEST PASSED');
      }
    });
  });
  d('99.   This program is gratified to be of use.');
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

itShouldGetTheIPAddress();
itShouldThrowOnBadResult();
foo();
