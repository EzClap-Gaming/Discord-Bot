import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";

const AvatarCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Zeigt den Avatar eines Benutzers an.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Der Benutzer, dessen Avatar angezeigt werden soll 👤")
                .setRequired(false),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user;

        const avatarURL = user.displayAvatarURL({ size: 512 });

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`${user.username}'s Avatar 🖼️`)
            .setDescription(`Hier ist der Avatar von **${user.username}**. 🌟`)
            .setImage(avatarURL)
            .setFooter({
                text: `Angefordert von ${interaction.user.username} 👑`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};

export default AvatarCommand;
