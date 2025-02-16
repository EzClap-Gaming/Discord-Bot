import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const ClearCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears commands or messages. Can only be used by users with moderation permissions.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('commands')
                .setDescription('Clears all bot commands.')
                .addStringOption(option =>
                    option.setName('amount')
                        .setDescription('Specify the number of commands to delete or type "all" to clear all.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'All', value: 'all' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('messages')
                .setDescription('Clears a specified number of messages in the current channel.')
                .addStringOption(option =>
                    option.setName('amount')
                        .setDescription('Specify the number of messages to delete or type "all" to clear all.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'All', value: 'all' }
                        )
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'commands') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Permission Denied')
                        .setDescription('You do not have the required permissions to clear commands.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const amount = interaction.options.getString('amount');
                
                if (amount === 'all') {
                    // Clear all commands
                    await interaction.client.application?.commands.set([]);
                    const embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('Commands Cleared')
                        .setDescription('All commands have been cleared successfully.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Invalid Input')
                        .setDescription('Please specify "all" to clear all commands.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }

            if (subcommand === 'messages') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Permission Denied')
                        .setDescription('You do not have permission to delete messages.')
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                const amount = interaction.options.getString('amount') || '10';

                if (amount === 'all') {
                    const channel = interaction.channel;
                    if (channel instanceof TextChannel) {
                        const messages = await channel.messages.fetch({ limit: 100 });
                        if (messages.size > 0) {
                            await channel.bulkDelete(messages, true);
                            const embed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('Messages Deleted')
                                .setDescription(`All messages have been deleted.`)
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('No Messages Found')
                                .setDescription('No messages found to delete.')
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Invalid Channel')
                            .setDescription('This command can only be used in a text channel.')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                } else {
                    const numAmount = parseInt(amount, 10);

                    const channel = interaction.channel;
                    if (channel instanceof TextChannel) {
                        const messages = await channel.messages.fetch({ limit: numAmount });
                        if (messages.size > 0) {
                            await channel.bulkDelete(messages, true);
                            const embed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('Messages Deleted')
                                .setDescription(`${numAmount} messages have been deleted.`)
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        } else {
                            const embed = new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('No Messages Found')
                                .setDescription('No messages found to delete.')
                                .setTimestamp();
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Invalid Channel')
                            .setDescription('This command can only be used in a text channel.')
                            .setTimestamp();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }
            }
        } catch (error) {
            console.error('[ClearCommand] Error:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Error')
                .setDescription('An error occurred while processing the command. Please try again later.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default ClearCommand;
