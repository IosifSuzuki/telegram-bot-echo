require('dotenv').config()

const os = require('os')
const Telegraf = require('telegraf')
const http = require('http')
const Iconv  = require('iconv').Iconv;

const urlForJoke = 'http://rzhunemogu.ru/RandJSON.aspx?CType=1'

const bot = new Telegraf(process.env.BOT_TOKEN)

function makeLog(contnet, title = '') {
    const prefixLog = '>>> '
    console.log(prefixLog, title, '\n', contnet)
}

bot.start((ctx) => {
    ctx.reply(`Welcome ${ctx.message.from.username}!`)
})

bot.help((ctx) => {
    ctx.reply('In development mode')
})

bot.command('joke', (ctx) => {
    http.get(urlForJoke, (res) => {
        let body = ''
        const iconv = new Iconv('windows-1251', 'utf8');
        res.on('data', (data) => {
            body += iconv.convert(data).toString()
        })

        res.on('end', () => {
            let preparedMessage = Array.from(body.matchAll(/{\s*"content":\s*"(.*)"\s*}/gs), array => array[1]).shift().trim()
            makeLog(preparedMessage, `Sent to ${ctx.message.from.username}`)
            ctx.reply(preparedMessage)
        })
    })
})

bot.command('systemInfo', (ctx) => {
    const cpusInfo = os.cpus().reduce((accumulator, cpu) => 
        accumulator += `\tModel: ${cpu.model}; speed: ${cpu.speed} MHz;\n`
    , '')

    const networkInterfaces = os.networkInterfaces()
    let networkInterfacesText = '{\n'
    
    for (let networkInterfaceKey in networkInterfaces) {
        let networkInterface = networkInterfaces[networkInterfaceKey]
        networkInterfacesText += `\t${networkInterfaceKey}:{\n`
        for (let itemKey in networkInterface) {
            for (key in networkInterface[itemKey]) {
                if (networkInterface[itemKey].hasOwnProperty(key)) {
                    networkInterfacesText += `\t\t${key}: ${networkInterface[itemKey][key]},\n`
                }
            }
        }
        networkInterfacesText += '\t},\n'
    }

    networkInterfacesText += '}'

    const upTimeSystem = os.uptime()

    let body = `Operating system CPU ${os.arch()};\n` +
    `Information about each logical CPU core:\n${cpusInfo}` +
    `Free system memmory: ${os.freemem()} bytes;\n` +
    `Total amount of system memory: ${os.totalmem()} bytes;\n` +
    `String identifying the operating system platform: ${os.platform()};\n` +
    `System uptime: {\n\t${upTimeSystem} seconds;\n\t${Math.floor(upTimeSystem / 24 * 3600)} days;\n\t${Math.floor(upTimeSystem / 3600)} hours;\n};\n` +
    `Network interfaces:\n${networkInterfacesText}`

    makeLog(body, `Sent to ${ctx.message.from.username}`)
    ctx.reply(body)
})

bot.hears('hi', (ctx) => {
    ctx.reply('Hey there')
})

bot.launch()