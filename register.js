const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const trading = require('../tradingInstance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register as a new trader'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guild = interaction.guild;
        const roleName = 'Paper Trader';
        const role = guild.roles.cache.find(role => role.name === roleName);

        if (!role) {
            return interaction.reply({
                content: `The role "${roleName}" does not exist. Please contact an admin.`,
                ephemeral: true
            });
        }

        const member = guild.members.cache.get(userId);
        const nickname = member.nickname || interaction.user.username;

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌ You are already registered!')
                        .setColor('#FF0000')
                ],
                ephemeral: true
            });
        }

        // Add the role to the user
        member.roles.add(role);

        // Logging for debugging
        console.log(`Registering user: ${nickname} (${userId})`);

        // Register the user in the trading system
        trading.registerUser(userId, nickname);

        // Logging to check if registration was successful
        console.log(`User registered successfully: ${trading.isUserRegistered(userId)}`);

        // Create a response message
        const embed = new EmbedBuilder()
            .setTitle('Welcome to Paper Trading!')
            .setDescription(`Welcome, ${nickname}! You have been registered with a starting balance of $100,000.`)
            .setColor('#00FF00');

        // Send a reply to the interaction
        await interaction.reply({ embeds: [embed] });

        // Announce the registration in the announcements channel
        const announcementsChannel = guild.channels.cache.find(channel => channel.name === 'dg-announcements');
        if (announcementsChannel) {
            announcementsChannel.send({ embeds: [embed] });
        }

        // Update the leaderboard
        await trading.updateLeaderboard(guild);
    },
};
