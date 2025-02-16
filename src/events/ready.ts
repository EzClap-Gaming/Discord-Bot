import { Client, EmbedBuilder, TextChannel } from 'discord.js';

export const handleReadyEvent = (client: Client) => {
    client.on('ready', async () => {
        try {
            console.info(`${client.user?.tag} is ready and online!`);

            await client.user?.setPresence({
                activities: [
                    { name: 'Turniere', type: 0 },
                    { name: 'EzClap Gaming', type: 3 },
                ],
                status: 'online',
            });

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Bot ist bereit! 🚀')
                .setDescription('Der Bot ist jetzt online und bereit zur Nutzung!')
                .setFooter({ text: 'Danke, dass du unseren Bot verwendest! 😊' })
                .setTimestamp();

            const channel = client.channels.cache.get('1316839155522867216');

            if (channel && channel instanceof TextChannel) {
                await channel.send({ embeds: [embed] });
            } else {
                console.error('The channel is not a TextChannel or could not be found.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error: ${errorMessage}`);
        }
    });
};
