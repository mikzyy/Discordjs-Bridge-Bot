const Discord = require("discord.js")
const config = require("./config.json")

const server1 = config.server1ID
const server1Bridge = config.server1BridgeID

const server2 = config.server2ID
const server2Bridge = config.server2BridgeID

const debugMode = config.debugMode

const bot = new Discord.Client()

bot.on('ready', () => {
    console.clear()
    console.log('Discord Bridge Bot ONLINE');
    if (debugMode) {
        console.log('Server 1 (' + server1 + ') monitoring channel ID: #' + server1Bridge);
        console.log('Server 2 (' + server2 + ') monitoring channel ID: #' + server2Bridge);
    }
    const guild1 = bot.guilds.get(server1)
    const channel1 = guild1.channels.get(server1Bridge)
    const guild2 = bot.guilds.get(server2)
    const channel2 = guild2.channels.get(server2Bridge)
    channel1.send("Discord Bridge **ONLINE!** Bridged with server: *" + guild2.name + "*.")
    channel2.send("Discord Bridge **ONLINE!** Bridged with server: *" + guild1.name + "*.")
})

bot.on('message', message => {
    if (message.author.id == bot.user.id) return;
    if (message.guild.id == server1) {
        if (message.channel.id == server1Bridge) {
            const guild = bot.guilds.get(server2)
            const channel = guild.channels.get(server2Bridge)
            if (channel) {
                let guildname = message.guild.name
                channel.send("**(" + guildname + ")** *" + message.author.username + "*: " + message.content)
                if (debugMode) {
                    console.log("(" + guildname + ") " + message.author.username + ": " + message.content)
                }
            }
        }
    }
    else if (message.guild.id == server2) {
        if (message.channel.id == server2Bridge) {
            const guild = bot.guilds.get(server1)
            const channel = guild.channels.get(server1Bridge)
            if (channel) {
                let guildname = message.guild.name
                channel.send("**(" + guildname + ")** *" + message.author.username + "*: " + message.content)
                if (debugMode) {
                    console.log("(" + guildname + ") " + message.author.username + ": " + message.content)
                }
            }
        }
    }
});

bot.on('messageDelete', (messageDelete) => {
    checkAndDeleteMsg(messageDelete, messageDelete.author.username, messageDelete.content.toString())
});

async function checkAndDeleteMsg(messageDelete, username, msgcontent)
{
    let guildname = messageDelete.guild.name
    if (messageDelete.guild.id == server1) {
        const guild = bot.guilds.get(server2)
        if (!guild) return console.log("Unable to find guild.")

        const channel = guild.channels.get(server2Bridge)
        if (!channel) return console.log("Unable to find channel.")

        try {
            await channel.fetchMessages().then(async messages => {
                messages.forEach(msg => {
                    if (msg.author.id === bot.user.id 
                        && msg.content.includes(username)
                        && msg.content.includes(msgcontent))
                    {
                        msg.edit("*Message deleted.*")
                        return;
                    }
                });
            });
        } catch (err) {
            console.error(err)
        }
    }
}

bot.login(config.token);