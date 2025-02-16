import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const EvalCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Führt einen JavaScript-Codeausschnitt aus. Dieser kann nur vom Bot-Besitzer verwendet werden. 🔒')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Der auszuführende JavaScript-Code. 📝')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const botOwnerId = process.env.BOT_OWNER_ID;

            if (interaction.user.id !== botOwnerId) {
                const permissionEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setDescription('❌ Sie sind nicht berechtigt, diesen Befehl zu verwenden.');

                await interaction.reply({ embeds: [permissionEmbed], ephemeral: true });
                return;
            }

            const code = interaction.options.getString('code');
            if (!code) {
                interaction.reply({
                    content: '⚠️ Bitte geben Sie Code zur Ausführung an.',
                    ephemeral: true
                });
                return;
            }

            let result = eval(code);
            if (result instanceof Promise) result = await result;

            const resultEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`✅ Ergebnis:\n\`\`\`js\n${result}\n\`\`\``);

            await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error executing code:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`❌ Fehler beim Ausführen des Codes:\n\`\`\`js\n${error}\n\`\`\``);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

export default EvalCommand;
