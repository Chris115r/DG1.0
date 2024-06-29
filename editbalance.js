const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editbalance')
        .setDescription('Edit a user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose balance to edit')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount to add or subtract')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You do not have permission to use this command.')
                        .setColor('#FF0000')
                ],
                ephemeral: true 
            });
        }

        const userId = interaction.options.getUser('user').id;
        const amount = interaction.options.getNumber('amount');
        const guild = interaction.guild;

        trading.editBalance(userId, amount, guild);
        await interaction.reply(`User's balance has been updated by $${amount}.`);
    },
};
