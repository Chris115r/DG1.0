const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showtrade')
        .setDescription('Show details of a trade')
        .addStringOption(option => option.setName('tradeid').setDescription('The ID of the trade').setRequired(true)),

    async execute(interaction) {
        const tradeId = interaction.options.getString('tradeid');
        const trade = trading.getTradeById(tradeId);

        if (!trade) {
            return interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ Trade not found.')
                        .setColor('#FF0000')
                ],
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Trade Details: ${trade.symbol}`)
            .setColor('#00FF00')
            .addFields(
                { name: 'Trade ID', value: trade.id.toString() },
                { name: 'User ID', value: trade.userId },
                { name: 'Symbol', value: trade.symbol },
                { name: 'Amount', value: trade.amount.toString() },
                { name: 'Take Profit', value: trade.takeProfit ? trade.takeProfit.toString() : 'N/A' },
                { name: 'Stop Loss', value: trade.stopLoss ? trade.stopLoss.toString() : 'N/A' },
                { name: 'Status', value: trade.status },
                { name: 'Timestamp', value: trade.timestamp }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`close-${tradeId}`)
                    .setLabel('Close Trade')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === `close-${tradeId}` && i.user.id === trade.userId;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === `close-${tradeId}`) {
                const timestamp = new Date().toLocaleString('en-US', { hour12: true });

                trading.closeTrade(tradeId, interaction);

                await i.update({ content: 'Trade closed successfully.', components: [] });

                const tradeLogChannel = interaction.guild.channels.cache.find(channel => channel.name === 'trade-log');
                if (tradeLogChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Trade Closed')
                        .setDescription(`Trade ID: ${tradeId}\nUser ID: ${trade.userId}\nSymbol: ${trade.symbol}\nAmount: ${trade.amount}\nStatus: Closed\nTime of Confirmation: ${trade.timestamp}\nTime of Exit: ${timestamp}`)
                        .setColor('#FF0000');
                    tradeLogChannel.send({ embeds: [embed] });
                }
            }
        });
    },
};
