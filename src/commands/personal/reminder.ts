import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { ReminderModel } from '../../models/Reminder';

const ReminderCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('erinnerung')
        .setDescription('Setze eine Erinnerung. ⏰')
        .addStringOption(option => 
            option.setName('nachricht')
                .setDescription('Die Nachricht der Erinnerung 📝')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('zeit')
                .setDescription('Zeit in Minuten, bevor du erinnert wirst ⏳')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const nachricht = interaction.options.getString('nachricht')!;
        const zeit = interaction.options.getInteger('zeit')!;

        const erinnerung = new ReminderModel({
            userId: interaction.user.id,
            message: nachricht,
            time: Date.now() + zeit * 60000,
        });

        await erinnerung.save();

        const erinnerungEmbed = new EmbedBuilder()
            .setColor('#FFCC00')
            .setTitle('Erinnerung gesetzt 🔔')
            .setDescription(`Ich werde dich in ${zeit} Minute(n) erinnern: "${nachricht}" ⏰`);

        await interaction.reply({ embeds: [erinnerungEmbed] });

        setTimeout(async () => {
            const gespeicherteErinnerung = await ReminderModel.findOne({
                _id: erinnerung._id,
                userId: interaction.user.id,
            });

            if (gespeicherteErinnerung) {
                const erinnerungZeitEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Erinnerung! 📢')
                    .setDescription(`Erinnerung: "${gespeicherteErinnerung.message}" ⏰`);
                await interaction.followUp({ embeds: [erinnerungZeitEmbed] });
            }
        }, zeit * 60000);
    },
};

export default ReminderCommand;
