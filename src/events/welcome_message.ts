import { Client, EmbedBuilder, GuildMember, TextChannel } from "discord.js";

export const handleWelcomeEvent = (client: Client) => {
    client.on("guildMemberAdd", async (member: GuildMember) => {
        try {
            const welcomeChannelId = "1316839154750984249";
            const channel = member.guild.channels.cache.get(welcomeChannelId);

            if (!channel || !(channel instanceof TextChannel)) {
                console.error("The welcome channel is not a TextChannel or could not be found.");
                return;
            }

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Willkommen auf dem Server! 🎉")
                .setDescription(
                    `Hey ${member}, willkommen auf **${member.guild.name}**! 🎊\n\nViel Spaß und eine tolle Zeit hier! 😊`,
                )
                .setThumbnail(member.user.displayAvatarURL({ extension: "png" }))
                .setFooter({ text: "Danke, dass du unserem Server beigetreten bist!" })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error sending welcome message: ${errorMessage}`);
        }
    });
};
