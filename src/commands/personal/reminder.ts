import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";
import { ReminderModel } from "../../models/Reminder";

const ReminderCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Setze eine Erinnerung.")
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("Die Nachricht der Erinnerung 📝")
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName("time")
                .setDescription("Zeit in Minuten, bevor du erinnert wirst ⏳")
                .setRequired(true)
                .setMinValue(1),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString("message")!;
        const time = interaction.options.getInteger("time")!;

        const erinnerung = new ReminderModel({
            userId: interaction.user.id,
            message: message,
            time: Date.now() + time * 60000,
        });

        await erinnerung.save();

        const erinnerungEmbed = new EmbedBuilder()
            .setColor("#FFCC00")
            .setTitle("Erinnerung gesetzt 🔔")
            .setDescription(`Ich werde dich in ${time} Minute(n) erinnern: "${message}" ⏰`);

        await interaction.reply({ embeds: [erinnerungEmbed] });

        setTimeout(async () => {
            const gespeicherteErinnerung = await ReminderModel.findOne({
                _id: erinnerung._id,
                userId: interaction.user.id,
            });

            if (gespeicherteErinnerung) {
                const erinnerungZeitEmbed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("Erinnerung! 📢")
                    .setDescription(`Erinnerung: "${gespeicherteErinnerung.message}" ⏰`);
                await interaction.followUp({ embeds: [erinnerungZeitEmbed] });
            }
        }, time * 60000);
    },
};

export default ReminderCommand;
