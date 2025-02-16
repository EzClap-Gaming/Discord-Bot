import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const SlowmodeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Manages slowmode for the server.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Sets the slowmode for the specified channel.')
                .addIntegerOption(option => option.setName('time')
                    .setDescription('Time in seconds between messages (1-21600 seconds), set to 0 to disable slowmode.')
                    .setRequired(true)
                    .setMinValue(0)
                    .setMaxValue(21600)
                )
                .addChannelOption(option => option.setName('channel')
                    .setDescription('The channel to set the slowmode for.')
                    .setRequired(true)
                    .addChannelTypes(0) // Only text channels
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes the slowmode for the specified channel.')
                .addChannelOption(option => option.setName('channel')
                    .setDescription('The channel to remove slowmode from.')
                    .setRequired(true)
                    .addChannelTypes(0) // Only text channels
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                const noPermissionEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('You do not have permission to change the slowmode.');
                await interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
                return;
            }

            const subcommand = interaction.options.getSubcommand();
            const channel = interaction.options.getChannel('channel') as TextChannel;

            if (subcommand === 'add') {
                const time = interaction.options.getInteger('time')!;

                if (channel instanceof TextChannel) {
                    await channel.setRateLimitPerUser(time);
                    const slowmodeEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`Slowmode has been set to ${time} seconds in ${channel}.`);
                    await interaction.reply({ embeds: [slowmodeEmbed], ephemeral: true });
                } else {
                    const notTextChannelEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('The specified channel is not a text channel.');
                    await interaction.reply({ embeds: [notTextChannelEmbed], ephemeral: true });
                }

            } else if (subcommand === 'remove') {
                if (channel instanceof TextChannel) {
                    await channel.setRateLimitPerUser(0); // Disable slowmode
                    const removeSlowmodeEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`Slowmode has been removed from ${channel}.`);
                    await interaction.reply({ embeds: [removeSlowmodeEmbed], ephemeral: true });
                } else {
                    const notTextChannelEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('The specified channel is not a text channel.');
                    await interaction.reply({ embeds: [notTextChannelEmbed], ephemeral: true });
                }
            }

        } catch (error) {
            console.error('[Slowmode] Error setting or removing slowmode:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('An error occurred while setting or removing the slowmode. Please try again later.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

export default SlowmodeCommand;
