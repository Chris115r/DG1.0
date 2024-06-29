const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('holdings')
        .setDescription('Check your holdings'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const trades = trading.getTradesByUser(userId);

            if (trades.length === 0) {
                return interaction.reply({ 
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('You have no open trades.')
                            .setColor('#FF0000')
                    ],
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Your Holdings')
                .setColor('#00FF00');

            trades.forEach(trade => {
                embed.addFields({ name: `Trade ID: ${trade.id}`, value: `Symbol: ${trade.symbol}, Amount: ${trade.amount}` });
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`❌ ${error.message}`)
                        .setColor('#FF0000')
                ],
                ephemeral: true 
            });
        }
    },
};
