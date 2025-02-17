import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import { Command } from "../../functions/handleCommands";

const NicknameCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Ändert den Spitznamen eines Mitglieds. Kann nur von Moderatoren verwendet werden.")
        .addUserOption((option) =>
            option
                .setName("member")
                .setDescription("Das Mitglied, dessen Spitzname geändert werden soll")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("nickname")
                .setDescription("Der neue Spitzname für das Mitglied")
                .setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ChangeNickname)) {
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Zugriff verweigert")
                    .setDescription("Sie sind nicht berechtigt, Spitznamen zu ändern.")
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const member = interaction.options.getMember("member") as GuildMember;
            const nickname = interaction.options.getString("nickname")!;

            if (!member) {
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Mitglied nicht gefunden")
                    .setDescription("Das Mitglied konnte nicht gefunden werden!")
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            await member.setNickname(nickname);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Spitzname geändert")
                .setDescription(`Der Spitzname von ${member.user.tag} wurde in ${nickname} geändert.`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error("Error changing nickname:", error);
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Error")
                .setDescription(
                    "Beim Ändern des Spitznamens ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

export default NicknameCommand;
