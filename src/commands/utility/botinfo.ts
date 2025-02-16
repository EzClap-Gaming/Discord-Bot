import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const BotInfoCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription(
            "Zeigt Informationen über den Bot an. Dies kann nur vom Besitzer genutzt werden.",
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const uptime = formatUptime(interaction.client.uptime);

            const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

            const botVersion = process.env.VERSION || "1.0.0";

            const botInfoEmbed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🤖 Bot-Informationen")
                .addFields(
                    {
                        name: "Bot-Name",
                        value: `${interaction.client.user?.username || "N/A"} 🤖`,
                        inline: true,
                    },
                    {
                        name: "Server",
                        value: `${interaction.client.guilds.cache.size} 🌍`,
                        inline: true,
                    },
                    {
                        name: "Benutzer",
                        value: `${interaction.client.users.cache.size} 👥`,
                        inline: true,
                    },
                    { name: "Betriebszeit", value: uptime, inline: true },
                    {
                        name: "Speicherverbrauch",
                        value: `${memoryUsage} MB`,
                        inline: true,
                    },
                    { name: "Bot-Version", value: botVersion, inline: true },
                )
                .setFooter({
                    text: "Bot-Info ⚡",
                    iconURL: interaction.client.user?.displayAvatarURL(),
                })
                .setTimestamp();

            await interaction.reply({ embeds: [botInfoEmbed], ephemeral: true });
        } catch (error) {
            console.error("Error retrieving bot info:", error);
            await interaction.reply({
                content:
                    "Es ist ein Fehler beim Abrufen der Bot-Informationen aufgetreten. Bitte versuche es später noch einmal. ⚠️",
                ephemeral: true,
            });
        }
    },
};

function formatUptime(uptime: number | undefined): string {
    if (!uptime) return "Unbekannt";

    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${days} Tage, ${hours} Stunden, ${minutes} Minuten`;
}

export default BotInfoCommand;
