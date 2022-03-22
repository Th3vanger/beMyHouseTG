let Parser = require('rss-parser');
let parser = new Parser();
const { Telegraf } = require('telegraf')
require('dotenv').config()
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
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.launch()
