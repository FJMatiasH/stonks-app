import axios from 'axios';
import * as cheerio from 'cheerio';

axios.get('https://www.dataroma.com/m/stock.php?sym=AAPL')
  .then(res => {
    const $ = cheerio.load(res.data);
    const firstRow = $('table#grid tbody tr').first();
    const tds = firstRow.find('td');
    console.log('td count:', tds.length);
    tds.each((i, el) => console.log(i, $(el).text().trim()));
  })
  .catch(console.error);
