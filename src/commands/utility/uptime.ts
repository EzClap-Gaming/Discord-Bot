import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const UptimeCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Zeigt an, wie lange der Bot schon online ist."),
    async execute(interaction: ChatInputCommandInteraction) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const uptimeEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("⏱️ **Bot Uptime**")
            .setDescription(
                `Der Bot ist bereits seit **${hours} Stunden, ${minutes} Minuten und ${seconds} Sekunden** online.`,
            )
            .addFields(
                {
                    name: "Laufzeit in Stunden",
                    value: `${hours} Stunden`,
                    inline: true,
                },
                {
                    name: "Laufzeit in Minuten",
                    value: `${minutes} Minuten`,
                    inline: true,
                },
                {
                    name: "Laufzeit in Sekunden",
                    value: `${seconds} Sekunden`,
                    inline: true,
                },
            )
            .setFooter({
                text: `Abgerufen von ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({ embeds: [uptimeEmbed] });
    },
};

export default UptimeCommand;
