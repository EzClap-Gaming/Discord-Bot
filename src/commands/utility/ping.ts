import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { performance } from 'perf_hooks';
import { Command } from '../../functions/handleCommands';

const PingCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Zeigt den Ping des Discord-Bots und des Servers an.'),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({ content: `⚠️ Dieser Befehl kann nur in einem Server verwendet werden.`, ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const botLatency = interaction.client.ws.ping;

            const start = performance.now();
            await interaction.guild.members.fetch();
            const end = performance.now();
            const serverLatency = Math.round(end - start);

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(`🌐 Ping von EzClap Gaming Services`)
                .setDescription(`Hier sind die aktuellen Ping-Werte des Discord-Bots und des Servers:`)
                .addFields(
                    { name: '🤖 Discord Bot', value: `${botLatency}ms`, inline: true },
                    { name: '🖥️ Server Latenz', value: `${serverLatency}ms`, inline: true }
                )
                .setFooter({ text: `Angefordert von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching latencies:', error);
            await interaction.editReply({ content: '❌ Es konnte keine Latenz gemessen werden. Bitte versuche es später erneut.' });
        }
    },
};

export default PingCommand;
