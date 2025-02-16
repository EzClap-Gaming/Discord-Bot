import { Client, Message, VoiceState } from 'discord.js';
import { Activity } from '../models/Activity';

export const handleActivityTracker = (client: Client) => {
    client.on('messageCreate', async (message: Message) => {
        if (message.author.bot || !message.guild) return;

        try {
            const userId = message.author.id;
            const guildId = message.guild.id;

            let activity = await Activity.findOne({ userId, guildId });

            if (!activity) {
                activity = new Activity({ userId, guildId, messagesSent: 0, voiceTime: 0 });
            }

            activity.messagesSent += 1;
            await activity.save();
        } catch (error) {
            console.error(`Error saving message count: ${error}`);
        }
    });

    client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
        if (!newState.guild) return;

        const userId = newState.id;
        const guildId = newState.guild.id;

        let activity = await Activity.findOne({ userId, guildId });

        if (!activity) {
            activity = new Activity({ userId, guildId, messagesSent: 0, voiceTime: 0 });
        }

        if (!oldState.channelId && newState.channelId) {
            activity.lastJoinTimestamp = Date.now();
        }

        if (oldState.channelId && !newState.channelId && activity.lastJoinTimestamp) {
            const joinedAt = activity.lastJoinTimestamp;
            const duration = Math.floor((Date.now() - joinedAt) / 1000);
            activity.voiceTime += duration;
            activity.lastJoinTimestamp = null;
        }

        await activity.save();
    });
};
