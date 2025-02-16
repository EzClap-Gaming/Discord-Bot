import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const ServerInfoCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Zeigt Informationen über den Server an.'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({ content: '⚠️ Dieser Befehl kann nur auf einem Server verwendet werden.', ephemeral: true });
            return;
        }

        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const verificationLevel = guild.verificationLevel;
        const premiumTier = guild.premiumTier;
        const memberCount = guild.memberCount;
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;
        const region = guild.preferredLocale;
        const iconUrl = guild.iconURL() || '';

        const textChannels = guild.channels.cache.filter(channel => channel.isTextBased()).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.isVoiceBased()).size;
        const boostCount = guild.premiumSubscriptionCount || null as any;

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`🖥️ **Server-Informationen**`)
            .setThumbnail(iconUrl)
            .addFields(
                { name: '🏷️ Server-Name', value: guild.name, inline: true },
                { name: '👑 Besitzer', value: owner.user.tag, inline: true },
                { name: '🔒 Verifizierungsstufe', value: verificationLevel.toString(), inline: true },
                { name: '🚀 Boost-Stufe', value: `Stufe ${premiumTier}`, inline: true },
                { name: '👥 Mitglieder', value: memberCount.toString(), inline: true },
                { name: '📅 Erstellt am', value: createdAt, inline: true },
                { name: '🌍 Region', value: region, inline: true },
                { name: '💬 Textkanäle', value: textChannels.toString(), inline: true },
                { name: '🔊 Sprachkanäle', value: voiceChannels.toString(), inline: true },
                { name: '🎉 Boosts', value: boostCount.toString(), inline: true }
            )
            .setFooter({ text: `Abgerufen von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .setImage(iconUrl);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

export default ServerInfoCommand;
