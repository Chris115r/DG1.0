
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

class PaperTrading {
    constructor() {
        this.trades = this.loadJSON('trades.json');
        this.players = this.loadJSON('players.json');
        this.availableTradeIds = this.loadJSON('availableTradeIds.json');
        this.leaderboardMessageId = this.loadJSON('leaderboardMessageId.json');
    }

    loadJSON(fileName) {
        const data = fs.readFileSync(`./data/${fileName}`);
        return JSON.parse(data);
    }

    saveJSON(fileName, data) {
        fs.writeFileSync(`./data/${fileName}`, JSON.stringify(data, null, 2));
    }

    getTradesByUser(userId) {
        return Object.values(this.trades).filter(trade => trade.userId === userId);
    }

    registerUser(userId, nickname) {
        if (!this.players[userId]) {
            this.players[userId] = {
                userId: userId,
                nickname: nickname,
                balance: 100000,
                trades: []
            };
            this.saveJSON('players.json', this.players);
        } else {
            throw new Error('User is already registered.');
        }
    }

    isUserRegistered(userId) {
        return !!this.players[userId];
    }

    resetData() {
        this.trades = {};
        this.players = {};
        this.availableTradeIds = [];
        this.saveJSON('trades.json', this.trades);
        this.saveJSON('players.json', this.players);
        this.saveJSON('availableTradeIds.json', this.availableTradeIds);
    }

    async updateLeaderboard(guild) {
        const leaderboardChannel = guild.channels.cache.find(channel => channel.name === 'leaderboard');
        if (!leaderboardChannel) return;

        const sortedPlayers = Object.values(this.players).sort((a, b) => b.balance - a.balance);
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setColor('#00FF00')
            .setDescription(sortedPlayers.map((player, index) => `${index + 1}. ${player.nickname} - $${player.balance}`).join('\n'));

        try {
            if (this.leaderboardMessageId.messageId) {
                const message = await leaderboardChannel.messages.fetch(this.leaderboardMessageId.messageId);
                await message.edit({ embeds: [embed] });
            } else {
                throw new Error('Message not found');
            }
        } catch (error) {
            const message = await leaderboardChannel.send({ embeds: [embed] });
            this.leaderboardMessageId.messageId = message.id;
            this.saveJSON('leaderboardMessageId.json', this.leaderboardMessageId);
        }
    }

    getBalance(userId) {
        const player = this.players[userId];
        if (player) {
            return player.balance;
        } else {
            throw new Error('User not found.');
        }
    }

    editBalance(userId, amount) {
        const player = this.players[userId];
        if (player) {
            player.balance = amount;
            this.saveJSON('players.json', this.players);
        } else {
            throw new Error('User not found.');
        }
    }

    // Other existing methods ...
}

module.exports = PaperTrading;
