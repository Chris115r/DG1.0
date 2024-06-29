const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Create a buy or sell trade')
        .addStringOption(option => option.setName('action').setDescription('Buy or Sell').setRequired(true))
        .addStringOption(option => option.setName('symbol').setDescription('The symbol to trade').setRequired(true))
        .addNumberOption(option => option.setName('amount').setDescription('The amount to trade').setRequired(true))
        .addNumberOption(option => option.setName('takeprofit').setDescription('The take profit price').setRequired(false))
        .addNumberOption(option => option.setName('stoploss').setDescription('The stop loss price').setRequired(false)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guild = interaction.guild;
        const action = interaction.options.getString('action');
        const symbol = interaction.options.getString('symbol');
        const amount = interaction.options.getNumber('amount');
        const takeProfit = interaction.options.getNumber('takeprofit');
        const stopLoss = interaction.options.getNumber('stoploss');

        if (!trading.isUserRegistered(userId)) {
            return interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You must be registered to use this command.')
                        .setColor('#FF0000')
                ],
                ephemeral: true 
            });
        }

        if (!trading.getBalance(userId, amount)) {
            return interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ Insufficient balance.')
                        .setColor('#FF0000')
                ],
                ephemeral: true 
            });
        }

        const tradeId = trading.createTrade(userId, symbol, amount, takeProfit, stopLoss);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm-${tradeId}`)
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel-${tradeId}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
            );

        const embed = new EmbedBuilder()
            .setTitle('Trade Confirmation')
            .setDescription(`You are about to ${action} ${amount} of ${symbol}. Confirm?`)
            .addFields({ name: 'Trade ID', value: tradeId })
            .setColor('#00FF00');

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId.startsWith('confirm-') || i.customId.startsWith('cancel-');
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id === userId) {
                if (i.customId.startsWith('confirm-')) {
                    trading.logTrade(trading.getTradeById(tradeId), interaction.user.username, 'Confirmed', new Date());
                    await i.update({ content: 'Trade confirmed.', components: [] });
                    await trading.updateLeaderboard(guild);  // Update leaderboard after trade confirmation
                } else if (i.customId.startsWith('cancel-')) {
                    trading.logTrade(trading.getTradeById(tradeId), interaction.user.username, 'Cancelled', new Date());
                    await i.update({ content: 'Trade cancelled.', components: [] });
                }
            } else {
                await i.reply({ content: 'You cannot interact with this trade. Only the user who initiated it can confirm or cancel.', ephemeral: true });
            }
        });

        collector.on('end', async collected => {
            if (!collected.size) {
                trading.logTrade(trading.getTradeById(tradeId), interaction.user.username, 'Timed out', new Date());
                await interaction.editReply({ content: 'Trade confirmation timed out.', components: [] });
            }
        });
    },
};
