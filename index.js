let Parser = require('rss-parser');
let parser = new Parser();
const { Composer } = require('micro-bot');
require('dotenv').config()
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});




async function analyzeFeed(){
    let feed= []
    let boolEnd = false
    const baseUrl = 'https://www.immobiliare.it/vendita-case/lucca/?criterio=dataModifica&ordine=desc&prezzoMassimo=180000&localiMinimo=3&idMZona[]=62&idMZona[]=10409&idMZona[]=10411&idMZona[]=64&idQuartiere[]=147&idQuartiere[]=12409&idQuartiere[]=205&idQuartiere[]=12405&mode=rss'
    let count = 1
    while (!boolEnd){
        try {
            let url = baseUrl
            if (count > 1 ) url = `${baseUrl}&pag=${count}`
            const result =  await parser.parseURL(url);
            feed.push(...result.items)
         console.log("test")
         } catch (error) {
            boolEnd = true
         }
         count++
    }

    // questa roba penso(credo) si possa ottimizzare con una promise all rimane il dubbio che non so come prendere tutte le pagine 
   return feed

}
const bot = new Composer()
bot.start((ctx) => {
   //client.connect();
   // client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
   //    if (err) throw err;
   //    for (let row of res.rows) {
   //       // ctx.reply(JSON.stringify(row))
   //    // console.log(JSON.stringify(row));
   //    }
   //    client.end();
   // });
   ctx.reply("girolamo")
      
})
bot.hears('/getFeed', async ({ reply }) => {
   const test = await analyzeFeed()
   console.log(test.length)
   reply(test.length)
})
module.exports = bot


