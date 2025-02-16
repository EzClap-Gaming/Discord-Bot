import { Client, Message } from 'discord.js';
import { AntiLink } from '../models/AntiLink';

export const handleAntiLink = (client: Client) => {
    client.on('messageCreate', async (message: Message) => {
        if (!message.guild || message.author.bot || !message.channel.isTextBased()) return;

        const linkRegex = /https?:\/\/[^\s]+/g;
        if (!linkRegex.test(message.content)) return;

        try {
            const antiLinkSettings = await AntiLink.findOne({ guildId: message.guild.id });
            if (!antiLinkSettings || !antiLinkSettings.isAntiLinkEnabled) return;

            if (!antiLinkSettings.allowedChannels.includes(message.channel.id)) {
                await message.delete();

                const dmMessage = `🚫 Du darfst keine Links in ${message.guild.name} senden. 🚫`;

                if (message.author.dmChannel) {
                    await message.author.dmChannel.send(dmMessage);
                } else {
                    await message.author.send(dmMessage);
                }

                console.info(`🗑️ Deleted link from ${message.author.tag} in ${message.guild.name}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error handling anti-link for ${message.author.tag} in ${message.guild.name}: ${errorMessage}`);
        }
    });
};
