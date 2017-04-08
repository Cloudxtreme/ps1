import console from 'better-console';
import Ocean from './ocean';
import line from '../junkDrawer';


const ocean = new Ocean();
console.log(Array(5).join(line('=')));

ocean.listOfDrops()
  .then((drops) => {
    console.log(Ocean.prettyDrops(drops));
  }).catch(err => console.log('error: ', err));
