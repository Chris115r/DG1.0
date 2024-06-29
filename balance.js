const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),

    async execute(interaction) {
        const userId = interaction.user.id;
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

        const balance = trading.getBalance(userId);
        await interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                    .setTitle('Balance')
                    .setDescription(`Your balance is $${balance}`)
                    .setColor('#00FF00')
                    .setFooter({ text: 'Balance checked', iconURL: interaction.guild.iconURL() })
            ]
        });
    },
};
