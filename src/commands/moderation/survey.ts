import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../functions/handleCommands';

const SurveyCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('survey')
        .setDescription('Create a survey with multiple options.')
        .addStringOption(option => option.setName('question')
            .setDescription('The question to ask in the survey')
            .setRequired(true)
        )
        .addStringOption(option => option.setName('option1')
            .setDescription('Option 1 for the survey')
            .setRequired(true)
        )
        .addStringOption(option => option.setName('option2')
            .setDescription('Option 2 for the survey')
            .setRequired(true)
        )
        .addStringOption(option => option.setName('option3')
            .setDescription('Option 3 for the survey')
            .setRequired(false)
        )
        .addStringOption(option => option.setName('option4')
            .setDescription('Option 4 for the survey')
            .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const question = interaction.options.getString('question')!;
            const option1 = interaction.options.getString('option1')!;
            const option2 = interaction.options.getString('option2')!;
            const option3 = interaction.options.getString('option3') || 'No option 3';
            const option4 = interaction.options.getString('option4') || 'No option 4';

            // Create the embed for the survey
            const embed = new EmbedBuilder()
                .setColor('#00AAFF')
                .setTitle('Survey')
                .setDescription(question)
                .addFields(
                    { name: '1️⃣ ' + option1, value: 'React with 1️⃣', inline: false },
                    { name: '2️⃣ ' + option2, value: 'React with 2️⃣', inline: false },
                    { name: '3️⃣ ' + option3, value: 'React with 3️⃣', inline: false },
                    { name: '4️⃣ ' + option4, value: 'React with 4️⃣', inline: false }
                )
                .setTimestamp();

            // Send the embed and react with the options
            const surveyMessage = await interaction.reply({
                embeds: [embed],
                fetchReply: true,
            });

            await surveyMessage.react('1️⃣');
            await surveyMessage.react('2️⃣');
            await surveyMessage.react('3️⃣');
            await surveyMessage.react('4️⃣');
        } catch (error) {
            console.error('[Survey] Error creating survey:', error);
            await interaction.reply({ content: 'An error occurred while creating the survey. Please try again later.', ephemeral: true });
        }
    },
};

export default SurveyCommand;
