import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const EvalCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Executes a JavaScript code snippet. This can only be used by the bot owner. 🔒')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The JavaScript code to execute. 📝')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const botOwnerId = process.env.BOT_OWNER_ID;

            if (interaction.user.id !== botOwnerId) {
                const permissionEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ You do not have permission to use this command.');

                await interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
                return;
            }

            const code = interaction.options.getString('code');
            if (!code) {
                interaction.reply({
                    content: '⚠️ Please provide some code to execute.',
                    ephemeral: true
                });
                return;
            }

            let result = eval(code);
            if (result instanceof Promise) result = await result;

            const resultEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`✅ Result:\n\`\`\`js\n${result}\n\`\`\``);

            await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
        } catch (error) {
            console.error('[Eval] Error executing code:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`❌ Error executing code:\n\`\`\`js\n${error}\n\`\`\``);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

export default EvalCommand;
