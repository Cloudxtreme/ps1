import console from 'better-console';
import Ocean from './ocean';
import { line } from '../junkDrawer';


const ocean = new Ocean();
console.log(Array(5).join(line('=')));
ocean.prettyListDrops().then(drops => console.log(drops));
