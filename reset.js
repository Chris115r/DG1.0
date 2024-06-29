const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset all data and remove the Paper Trader role from all users'),

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

        const guild = interaction.guild;
        const roleName = 'Paper Trader';
        const role = guild.roles.cache.find(role => role.name === roleName);

        if (!role) {
            return interaction.reply({
                content: `The role "${roleName}" does not exist. Please contact an admin.`,
                ephemeral: true
            });
        }

        // Remove the Paper Trader role from all members who have it
        const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));
        for (const member of membersWithRole.values()) {
            await member.roles.remove(role);
        }

        // Preserve the leaderboard message ID
        const leaderboardMessageId = JSON.parse(fs.readFileSync('./data/leaderboardMessageId.json'));

        // Reset trading data
        trading.resetData();

        // Restore the leaderboard message ID
        fs.writeFileSync('./data/leaderboardMessageId.json', JSON.stringify(leaderboardMessageId));

        // Reply to the interaction
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('✅ All data has been reset and the Paper Trader role has been removed from all users.')
                    .setColor('#00FF00')
            ]
        });
    },
};
