let Parser = require('rss-parser');
const { Composer } = require('micro-bot');
const { Telegraf } = require('telegraf')
const format = require('node-pg-format');

const { Client } = require('pg');
require('dotenv').config()

const HTMLParser = require('node-html-parser');


async function getFeedImmobiliare(){
   let parser = new Parser();
    let feed= []
    let boolEnd = false
    const baseUrl = 'https://www.immobiliare.it/vendita-case/lucca/?criterio=dataModifica&ordine=desc&prezzoMassimo=200000&localiMinimo=3&idMZona[]=10409&idMZona[]=10411&idMZona[]=64&idMZona[]=62&idQuartiere[]=12409&idQuartiere[]=205&idQuartiere[]=12405&idQuartiere[]=190&mode=rss'
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
    
   
    const client = new Client({
       connectionString: process.env.DATABASE_URL,
       ssl: {
         rejectUnauthorized: false
       }
     });
    await client.connect()
    sql = format(`select * from house `)
    let feedSaved = await client.query(sql)
    feedSaved = feedSaved.rows
    feedSaved= feedSaved.map(element => element.url)
    let difference = feed.filter(x => !feedSaved.includes(x));
    await client.end()
    
    return difference

}

async function saveFeedImmobiliare(feedImmobiliare){
   const sql = format(`INSERT INTO house (url,site) VALUES %L`, feedImmobiliare)
   const client = new Client({
       connectionString: process.env.DATABASE_URL,
       ssl: {
         rejectUnauthorized: false
       }
     });
   await client.connect()
   await client.query(sql)
   await client.end()
   return "Immobili salvati con successo"
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
bot.hears('/get_feed_immobiliare', async (ctx) => {
   const feedImmobiliare = await getFeedImmobiliare()
   if (feedImmobiliare.length === 0 ) return ctx.reply("Non ci sono nuovi immobili da Immobiliare.it ")
   feedImmobiliare.forEach(element => {ctx.reply(element)})
})
bot.hears('/save_feed_immobiliare', async (ctx) => {
   let feedImmobiliare = await getFeedImmobiliare()
   if (feedImmobiliare.length === 0) return ctx.reply("Non ci sono immobili da salvare su Immobiliare.it ")
   feedImmobiliare = feedImmobiliare.map(element => [element,0])
   ctx.reply(await saveFeedImmobiliare(feedImmobiliare))
})

//sql = format('INSERT INTO t (name, age) VALUES %L', myNestedArray); 
//  bot.launch()
module.exports = bot


