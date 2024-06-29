require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.login(process.env.DISCORD_TOKEN);

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const alert = req.body;

    // Customize the message based on the alert content
    const message = `🔔 TradingView Alert 🔔\nSymbol: ${alert.symbol}\nPrice: ${alert.price}\nAction: ${alert.action}`;

    // Send the message to a specific Discord channel
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if (channel) {
        await channel.send(message);
    }

    res.status(200).send('Alert received');
});

client.once('ready', () => {
    console.log('Discord client is ready');
    app.listen(port, () => {
        console.log(`Webhook server is listening on port ${port}`);
    });
});
