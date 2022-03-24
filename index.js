let Parser = require('rss-parser');
const { Composer } = require('micro-bot');
const { Telegraf } = require('telegraf')
const format = require('node-pg-format');

const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const HTMLParser = require('node-html-parser');
require('dotenv').config()

async function analyzeFeed(){
   let parser = new Parser();
    let feed= []
    let boolEnd = false
    const baseUrl = 'https://www.immobiliare.it/vendita-case/lucca/?criterio=dataModifica&ordine=desc&prezzoMassimo=180000&localiMinimo=3&idMZona[]=62&idMZona[]=10409&idMZona[]=10411&idMZona[]=64&idQuartiere[]=147&idQuartiere[]=12409&idQuartiere[]=205&idQuartiere[]=12405&mode=rss'
    let count = 1
    while (!boolEnd){
        try {
            let url = baseUrl
            if (count > 1 ) url = `${baseUrl}&pag=${count}`
            const result =  await parser.parseURL(url);
            feed.push(...result.items.map(element => element.link))
         //console.log("test")
         } catch (error) {
            boolEnd = true
         }
         count++
    }
    // questa roba penso(credo) si possa ottimizzare con una promise all rimane il dubbio che non so come prendere tutte le pagine 
    return feed

}
const bot = new Composer()
// const bot = new Telegraf(process.env.BOT_TOKEN)
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
bot.hears('/getFeed', async (ctx) => {
   const test = await analyzeFeed()
   const b = test.map(element => [element,0])
   sql = format(`INSERT INTO house (url,site) VALUES %L`, b)
   await client.connect()
   await client.query(sql)

   ctx.reply('vai a vede barbone')
})
bot.hears('/getFeedPos', async (ctx) => {
   
 
   sql = format(`select * from house `)
   await client.connect()
   const res = await client.query(sql)
   console.log(JSON.stringify(res))
   ctx.reply(JSON.stringify(res))
})

//sql = format('INSERT INTO t (name, age) VALUES %L', myNestedArray); 
// bot.launch()
module.exports = bot


