import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Level } from "../../models/Level";
import { LevelUtil } from "../../utils/levelUtil";

const LevelCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Überprüfe dein Level und deine XP-Statistiken.")
        .addSubcommand((subcommand) =>
            subcommand.setName("current").setDescription("Überprüfe dein aktuelles Level und XP."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("progress")
                .setDescription("Überprüfe deinen Fortschritt zum nächsten Level."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("leaderboard")
                .setDescription("Zeige die Rangliste der höchsten Level-Nutzer im Server."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("statistics")
                .setDescription("Überprüfe deine Level-Statistiken der letzten 30 Tage."),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const { commandName, options } = interaction;
        const userId = interaction.user.id;

        if (commandName === "level") {
            const subcommand = options.getSubcommand();

            if (subcommand === "current") {
                const levelData = await LevelUtil.getUserLevelData(userId);
                if (!levelData) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Keine Level-Daten für diesen Benutzer gefunden."),
                        ],
                    });
                    return;
                }

                const { level } = levelData;

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`${interaction.user.username}'s Level`)
                    .setDescription(`Dein aktuelles Level ist **${level}**`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields({
                        name: "Aktuelles Level",
                        value: `${level}`,
                        inline: true,
                    })
                    .setFooter({
                        text: `Angefordert von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                await interaction.reply({ embeds: [embed] });
            }

            if (subcommand === "progress") {
                const levelData = await LevelUtil.getUserLevelData(userId);
                if (!levelData) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Keine Level-Daten für diesen Benutzer gefunden."),
                        ],
                    });
                    return;
                }

                const { level, xp, nextLevelXp } = levelData;
                const xpNeeded = nextLevelXp - xp;
                const progress = Math.floor((xp / nextLevelXp) * 100);
                const chartData = {
                    type: "bar",
                    data: {
                        labels: ["Fortschritt"],
                        datasets: [
                            {
                                label: "XP-Fortschritt",
                                data: [progress],
                                backgroundColor: "#4caf50",
                                borderRadius: 20,
                                borderWidth: 0,
                                borderColor: "rgba(0, 0, 0, 0)",
                                hoverBackgroundColor: "#388e3c",
                            },
                        ],
                    },
                    options: {
                        indexAxis: "x",
                        scales: {
                            x: { min: 0, max: 100, ticks: { display: false } },
                            y: { beginAtZero: true, display: false },
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        width: 500,
                        height: 100,
                    },
                };

                const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`${interaction.user.username}'s Fortschritt`)
                    .addFields(
                        { name: "Aktuelles Level", value: `${level}`, inline: true },
                        { name: "Aktuelle XP", value: `${xp}`, inline: true },
                        {
                            name: "XP bis zum nächsten Level",
                            value: `${xpNeeded}`,
                            inline: true,
                        },
                    )
                    .setImage(chartUrl)
                    .setFooter({
                        text: `Angefordert von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                await interaction.reply({ embeds: [embed] });
            }

            if (subcommand === "leaderboard") {
                const leaderboard = await LevelUtil.getLeaderboardData();
                if (!leaderboard || leaderboard.length === 0) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Keine Ranglistendaten gefunden."),
                        ],
                    });
                    return;
                }

                leaderboard.sort((a, b) => b.xp - a.xp);

                const getPlacementEmoji = (index: number) => {
                    if (index === 0) return "🥇";
                    if (index === 1) return "🥈";
                    if (index === 2) return "🥉";
                    return `#${index + 1}`;
                };

                const leaderboardWithAvatars = await Promise.all(
                    leaderboard.map(async (user) => {
                        const discordUser = await interaction.client.users.fetch(user.userId);
                        return {
                            ...user,
                            avatarUrl: discordUser.displayAvatarURL(),
                            displayName: discordUser.username,
                        };
                    }),
                );

                const embed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("Rangliste: Höchste Level-Nutzer")
                    .setDescription("Hier sind die besten Level-Nutzer im Server:")
                    .setFooter({
                        text: `Angefordert von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                leaderboardWithAvatars.forEach((user, index) => {
                    embed.addFields({
                        name: `${getPlacementEmoji(index)} ${user.displayName}`,
                        value: `Level: ${user.level}, XP: ${user.xp}`,
                        inline: false,
                    });
                });

                await interaction.reply({ embeds: [embed] });
            }

            if (subcommand === "statistics") {
                const userData = await Level.findOne({ userId });
                if (!userData) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Keine Level-Daten für diesen Benutzer gefunden."),
                        ],
                    });
                    return;
                }

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const recentXpHistory = userData.xpHistory.filter(
                    (entry) => entry.date >= thirtyDaysAgo,
                );
                if (recentXpHistory.length === 0) {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription("Keine XP-Daten für die letzten 30 Tage gefunden."),
                        ],
                    });
                    return;
                }

                const totalXp = recentXpHistory.reduce((acc, entry) => acc + entry.xpEarned, 0);
                const xpPerDay = recentXpHistory.reduce(
                    (acc, entry) => {
                        const day = entry.date.toISOString().split("T")[0];
                        if (!acc[day]) acc[day] = 0;
                        acc[day] += entry.xpEarned;
                        return acc;
                    },
                    {} as Record<string, number>,
                );

                const days = Object.keys(xpPerDay);
                const xpData = days.map((day) => xpPerDay[day]);

                const chartData = {
                    type: "line",
                    data: {
                        labels: days,
                        datasets: [
                            {
                                label: "XP Verdient",
                                data: xpData,
                                borderColor: "#4caf50",
                                backgroundColor: "rgba(76, 175, 80, 0.2)",
                                fill: true,
                                tension: 0.4,
                            },
                        ],
                    },
                    options: {
                        scales: {
                            x: { beginAtZero: true, title: { display: true, text: "Tage" } },
                            y: { beginAtZero: true, title: { display: true, text: "XP" } },
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: true },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        width: 600,
                        height: 300,
                    },
                };

                const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`${interaction.user.username}'s Level-Statistiken (Letzte 30 Tage)`)
                    .addFields(
                        { name: "Level", value: `${userData.level}`, inline: true },
                        { name: "Gesamt XP", value: `${userData.xp}`, inline: true },
                        {
                            name: "Gesamt XP (Letzte 30 Tage)",
                            value: `${totalXp}`,
                            inline: true,
                        },
                        {
                            name: "Gesamt Level-Ups",
                            value: `${userData.levelUpCount || 0}`,
                            inline: true,
                        },
                    )
                    .setImage(chartUrl)
                    .setFooter({
                        text: `Angefordert von ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                await interaction.reply({ embeds: [embed] });
            }
        }
    },
};

export default LevelCommand;
