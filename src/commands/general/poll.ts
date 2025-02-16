import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const PollCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Erstellt eine Umfrage mit Ja/Nein-Antworten.')
        .addStringOption(option => option.setName('question').setDescription('Die Frage der Umfrage').setRequired(true))
        .addIntegerOption(option => 
            option.setName('duration')
                .setDescription('Dauer der Umfrage in Minuten')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(1440)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const question = interaction.options.getString('question')!;
        const duration = interaction.options.getInteger('duration') || 5;

        const pollEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Umfrage')
            .setDescription(`**Frage**: ${question}\n\nReagiere mit ✅ für Ja oder ❌ für Nein.\n\nDie Umfrage endet in **${duration} Minuten**.`)
            .setFooter({ text: `Umfrage erstellt von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const pollMessage = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

        await pollMessage.react('✅');
        await pollMessage.react('❌');

        setTimeout(async () => {
            const updatedPoll = await pollMessage.fetch();
            const yesVotes = updatedPoll.reactions.cache.get('✅')?.count || 0;
            const noVotes = updatedPoll.reactions.cache.get('❌')?.count || 0;

            const resultEmbed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Umfrage beendet')
                .setDescription(`**Frage**: ${question}\n\n**Ja**: ${yesVotes - 1} Stimmen\n**Nein**: ${noVotes - 1} Stimmen`)
                .setFooter({ text: `Umfrage beendet von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await pollMessage.edit({ embeds: [resultEmbed] });

        }, duration * 60000);
    },
};

export default PollCommand;
