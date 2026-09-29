import axios from 'axios';
import * as cheerio from 'cheerio';

axios.get('https://www.dataroma.com/m/stock.php?sym=AAPL')
  .then(res => {
    const $ = cheerio.load(res.data);
    const rows = $('table#grid tbody tr');
    console.log('Rows in table:', rows.length);
    rows.each((i, el) => {
      if(i < 3) console.log($(el).text().replace(/\s+/g, ' '));
    });
  })
  .catch(console.error);
