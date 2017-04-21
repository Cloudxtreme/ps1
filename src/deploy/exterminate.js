import Ocean from './ocean';
import { line } from '../junkDrawer';
import { d } from '../logging';

async function exterminate() {
  const ocean = new Ocean();
  d(Array(5).join(line('=')));
  const before = await ocean.prettyListDrops();
  d(`Old droplets to drop:\n${before}`);
  await ocean.destroyDrops();
  const after = await ocean.prettyListDrops();
  d(`Old droplets to drop:\n${after}`);
}

exterminate();
