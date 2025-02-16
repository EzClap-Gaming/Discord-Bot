import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
} from "discord.js";
import { Command } from "../../functions/handleCommands";
import { Economy } from "../../models/Economy";

interface ShopItem {
    name: string;
    price: number;
}

const shopItems: ShopItem[] = [
    { name: "Glock-18", price: 200 },
    { name: "P2000", price: 200 },
    { name: "USP-S", price: 200 },
    { name: "P250", price: 300 },
    { name: "Five-Seven", price: 500 },
    { name: "CZ-75", price: 500 },
    { name: "Tec-9", price: 500 },
    { name: "Deser Eagle", price: 700 },
    { name: "R8 Revolver", price: 600 },
    { name: "Dual Barretta", price: 500 },
    { name: "MAG-7", price: 1200 },
    { name: "Nova", price: 2200 },
    { name: "Sawed-Off", price: 1200 },
    { name: "XM1014", price: 2000 },
    { name: "MAC-10", price: 1050 },
    { name: "MP5-SD", price: 1500 },
    { name: "MP7", price: 1500 },
    { name: "MP9", price: 1250 },
    { name: "PP-Bizon", price: 1400 },
    { name: "P90", price: 2350 },
    { name: "UMP-45", price: 1200 },
    { name: "AK-47", price: 2700 },
    { name: "AUG", price: 3300 },
    { name: "FAMAS", price: 2050 },
    { name: "Galil AR", price: 1800 },
    { name: "M4A4", price: 3100 },
    { name: "M4A1-S", price: 2900 },
    { name: "SG 553", price: 3000 },
    { name: "AWP", price: 4750 },
    { name: "G3SG1", price: 5000 },
    { name: "SCAR-20", price: 5000 },
    { name: "SSG 08", price: 1700 },
    { name: "M249", price: 5200 },
    { name: "Negev", price: 1700 },
];

const EconomyCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("economy")
        .setDescription("Verwalten Sie Ihr Wirtschaftssystem.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add-coins")
                .setDescription("Fügen Sie einem Benutzer Münzen hinzu.")
                .addUserOption((option) =>
                    option
                        .setName("target")
                        .setDescription("Der Benutzer, dem Münzen hinzugefügt werden sollen.")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Die Anzahl der hinzuzufügenden Münzen.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("balance").setDescription("Prüfen Sie Ihren aktuellen Kontostand."),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("bank").setDescription("Sehen Sie sich Ihren Kontostand an."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("bet")
                .setDescription("Setzen Sie Geld, um zu gewinnen oder zu verlieren!")
                .addIntegerOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Der zu setzende Betrag")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("daily").setDescription("Fordern Sie Ihre tägliche Belohnung an."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("deposit")
                .setDescription("Zahlen Sie Münzen auf Ihr Bankkonto ein.")
                .addIntegerOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Anzahl der einzuzahlenden Münzen.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("leaderboard")
                .setDescription("Zeigt die Top-Benutzer nach Guthaben an."),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("pay")
                .setDescription("Senden Sie Münzen an einen anderen Benutzer.")
                .addUserOption((option) =>
                    option
                        .setName("recipient")
                        .setDescription("Der Benutzer, an den Sie Münzen senden möchten.")
                        .setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("Die Anzahl der zu sendenden Münzen.")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("rob")
                .setDescription("Versuch, einen anderen Benutzer auszurauben!")
                .addUserOption((option) =>
                    option
                        .setName("target")
                        .setDescription("Der Benutzer zu rauben")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("shop")
                .setDescription("Durchsuchen und kaufen Sie Artikel im Shop.")
                .addStringOption((option) =>
                    option
                        .setName("item")
                        .setDescription("Der Artikel, den Sie kaufen möchten.")
                        .addChoices(
                            { name: "Golden Sword", value: "Golden Sword" },
                            { name: "Shield", value: "Shield" },
                            { name: "Health Potion", value: "Health Potion" },
                        )
                        .setRequired(false),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("work").setDescription("Arbeiten und verdienen Geld"),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("withdraw")
                .setDescription("Geld abheben")
                .addIntegerOption((option) =>
                    option.setName("amount").setDescription("Betrag zum Abheben").setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        const userId = interaction.user.id;

        try {
            if (subcommand === "add-coins") {
                if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                    await interaction.reply({
                        content: "Sie sind nicht berechtigt, diesen Befehl zu verwenden.",
                        ephemeral: true,
                    });
                    return;
                }

                const target = interaction.options.getUser("target");
                const amount = interaction.options.getInteger("amount");

                if (!target || !amount || amount <= 0) {
                    await interaction.reply({
                        content: "Ungültiger Benutzer oder Betrag.",
                        ephemeral: true,
                    });
                    return;
                }

                let economy = await Economy.findOne({ userId: target.id });

                if (!economy) {
                    economy = new Economy({ userId: target.id });
                }

                economy.balance += amount;
                await economy.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Hinzugefügte Münzen")
                    .setDescription(
                        `💸 **${amount} Münzen** erfolgreich zu ${target.username} hinzugefügt.`,
                    )
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "balance") {
                const userId = interaction.user.id;
                let economy = await Economy.findOne({ userId });

                if (!economy) {
                    economy = new Economy({ userId });
                    await economy.save();
                }

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Ihr Guthaben")
                    .setDescription(`💰 Sie haben derzeit **${economy.balance} Münzen**.`)
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "bank") {
                const userId = interaction.user.id;
                const economy = await Economy.findOne({ userId });

                if (!economy) {
                    await interaction.reply({
                        content: "Sie haben noch kein Konto.",
                        ephemeral: true,
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Kontostand")
                    .addFields(
                        {
                            name: "Wallet-Guthaben",
                            value: `${economy.balance} coins`,
                            inline: true,
                        },
                        {
                            name: "Kontostand",
                            value: `${economy.bankBalance || 0} coins`,
                            inline: true,
                        },
                    )
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "bet") {
                const userId = interaction.user.id;
                const betAmount = interaction.options.getInteger("amount") || 0;

                if (betAmount <= 0) {
                    await interaction.reply({
                        content: "Sie müssen einen positiven Betrag setzen!",
                        ephemeral: true,
                    });
                    return;
                }

                const userEconomy = await Economy.findOne({ userId });

                if (!userEconomy) {
                    await interaction.reply({
                        content:
                            "Sie haben kein Konto! Verwenden Sie /createaccount, um zu beginnen.",
                        ephemeral: true,
                    });
                    return;
                }

                if (userEconomy.balance < betAmount) {
                    await interaction.reply({
                        content: "Sie haben nicht genug Geld, um diesen Betrag zu setzen.",
                        ephemeral: true,
                    });
                    return;
                }

                const won = Math.random() < 0.5;
                const embed = new EmbedBuilder().setTimestamp();

                if (won) {
                    const winnings = betAmount * 2;
                    userEconomy.balance += betAmount;
                    embed
                        .setColor("Random")
                        .setTitle("Du hast gewonnen!")
                        .setDescription(
                            `Sie haben **$${betAmount}** gesetzt und **$${winnings}** gewonnen!`,
                        )
                        .setFooter({ text: `Neuer Kontostand: $${userEconomy.balance}` });
                } else {
                    userEconomy.balance -= betAmount;
                    embed
                        .setColor("Random")
                        .setTitle("Du hast verloren!")
                        .setDescription(`Sie haben **$${betAmount}** gesetzt und alles verloren.`)
                        .setFooter({ text: `Neuer Kontostand: $${userEconomy.balance}` });
                }

                await userEconomy.save();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "daily") {
                const userId = interaction.user.id;
                const dailyReward = 100;
                const streakBonus = 10;

                let economy = await Economy.findOne({ userId });

                if (!economy) {
                    economy = new Economy({ userId });
                    await economy.save();
                }

                const now = new Date();
                const lastDaily = economy.lastDaily;

                if (
                    lastDaily &&
                    now.getDate() === lastDaily.getDate() &&
                    now.getMonth() === lastDaily.getMonth() &&
                    now.getFullYear() === lastDaily.getFullYear()
                ) {
                    await interaction.reply({
                        content: "Sie haben Ihre Tagesbelohnung heute bereits eingefordert!",
                        ephemeral: true,
                    });
                    return;
                }

                if (lastDaily && now.getTime() - new Date(lastDaily).getTime() <= 86400000 * 2) {
                    economy.dailyStreak += 1;
                } else {
                    economy.dailyStreak = 1;
                }

                const totalReward = dailyReward + streakBonus * economy.dailyStreak;
                economy.balance += totalReward;
                economy.lastDaily = now;

                await economy.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Tägliche Belohnung eingefordert")
                    .setDescription(
                        `🎉 Du hast **${totalReward} Münzen** erhalten!\nAktuelle Serie: **${economy.dailyStreak} Tage**`,
                    )
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "deposit") {
                const userId = interaction.user.id;
                const amount = interaction.options.getInteger("amount");

                if (!amount || amount <= 0) {
                    await interaction.reply({
                        content: "Sie müssen einen gültigen Betrag einzahlen.",
                        ephemeral: true,
                    });
                    return;
                }

                const economy = await Economy.findOne({ userId });

                if (!economy || economy.balance < amount) {
                    await interaction.reply({
                        content: "Sie haben nicht genügend Münzen zum Einzahlen.",
                        ephemeral: true,
                    });
                    return;
                }

                economy.balance -= amount;
                economy.bankBalance = (economy.bankBalance || 0) + amount;
                await economy.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Einzahlung erfolgreich")
                    .setDescription(`Sie haben **${amount} Münzen** auf Ihre Bank eingezahlt.`)
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "leaderboard") {
                const topUsers = await Economy.find().sort({ balance: -1 }).limit(10);

                const embed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("Top 10 der reichsten Benutzer")
                    .setDescription(
                        topUsers
                            .map(
                                (user, index) =>
                                    `**${index + 1}.** <@${user.userId}> - **${user.balance} Münzen**`,
                            )
                            .join("\n") || "Keine Benutzer gefunden.",
                    )
                    .setFooter({
                        text: "Bestenliste",
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: false });
            } else if (subcommand === "pay") {
                const recipient = interaction.options.getUser("recipient");
                const amount = interaction.options.getInteger("amount");
                const senderId = interaction.user.id;

                if (!recipient || !amount || amount <= 0) {
                    await interaction.reply({
                        content: "Ungültiger Empfänger oder Betrag.",
                        ephemeral: true,
                    });
                    return;
                }

                if (recipient.id === senderId) {
                    await interaction.reply({
                        content: "Sie können sich selbst keine Münzen senden.",
                        ephemeral: true,
                    });
                    return;
                }

                const senderEconomy = await Economy.findOne({ userId: senderId });
                const recipientEconomy = await Economy.findOne({
                    userId: recipient.id,
                });

                if (!senderEconomy || senderEconomy.balance < amount) {
                    await interaction.reply({
                        content:
                            "Sie haben nicht genügend Münzen, um diese Transaktion abzuschließen.",
                        ephemeral: true,
                    });
                    return;
                }

                if (!recipientEconomy) {
                    await Economy.create({ userId: recipient.id, balance: amount });
                } else {
                    recipientEconomy.balance += amount;
                    await recipientEconomy.save();
                }

                senderEconomy.balance -= amount;
                await senderEconomy.save();

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Zahlung erfolgreich")
                    .setDescription(
                        `Sie haben **${amount} Münzen** an **${recipient.username}** gesendet.`,
                    )
                    .setFooter({
                        text: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === "rob") {
                const userId = interaction.user.id;
                const targetUser = interaction.options.getUser("target");

                if (!targetUser || targetUser.id === userId) {
                    await interaction.reply({
                        content: "Sie können weder sich selbst noch ein ungültiges Ziel ausrauben.",
                        ephemeral: true,
                    });
                    return;
                }

                const now = new Date();

                try {
                    const userEconomy = await Economy.findOne({ userId });
                    const targetEconomy = await Economy.findOne({
                        userId: targetUser.id,
                    });

                    if (!userEconomy || !targetEconomy) {
                        await interaction.reply({
                            content: "Entweder Sie oder das Ziel haben kein Konto!",
                            ephemeral: true,
                        });
                        return;
                    }

                    if (
                        userEconomy.robCooldown &&
                        now.getTime() - userEconomy.robCooldown.getTime() < 7200000
                    ) {
                        const remaining =
                            7200000 - (now.getTime() - userEconomy.robCooldown.getTime());
                        await interaction.reply({
                            content: `Sie können in ${Math.ceil(remaining / 60000)} Minuten erneut rauben.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    if (targetEconomy.balance < 100) {
                        await interaction.reply({
                            content: "Ihr Ziel hat nicht genug Geld, um es auszurauben!",
                            ephemeral: true,
                        });
                        return;
                    }

                    const success = Math.random() < 0.5;
                    if (success) {
                        const stolenAmount = Math.floor(
                            targetEconomy.balance * (Math.random() * 0.3),
                        );
                        targetEconomy.balance -= stolenAmount;
                        userEconomy.balance += stolenAmount;
                        userEconomy.robCooldown = now;

                        await targetEconomy.save();
                        await userEconomy.save();

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Random")
                                    .setTitle("Raubüberfall erfolgreich!")
                                    .setDescription(
                                        `Sie haben erfolgreich **$${stolenAmount}** von ${targetUser.username} ausgeraubt!`,
                                    ),
                            ],
                            ephemeral: true,
                        });
                    } else {
                        userEconomy.robCooldown = now;
                        await userEconomy.save();

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Random")
                                    .setTitle("Raubüberfall fehlgeschlagen!")
                                    .setDescription(
                                        `Sie wurden beim Versuch erwischt, ${targetUser.username} auszurauben und sind kläglich gescheitert!`,
                                    ),
                            ],
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    console.error("Rob command error:", error);
                    await interaction.reply({
                        content:
                            "Beim Versuch, den Datenträger auszurauben, ist ein Fehler aufgetreten.",
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "shop") {
                try {
                    const selectedItem = interaction.options.getString("item");

                    if (!selectedItem) {
                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Shop-Artikel")
                            .setDescription(
                                shopItems
                                    .map((item) => `**${item.name}** - ${item.price} Münzen`)
                                    .join("\n"),
                            )
                            .setFooter({
                                text: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTimestamp();

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    const item = shopItems.find((i) => i.name === selectedItem);
                    if (!item) {
                        await interaction.reply({
                            content: "Ungültiges Element ausgewählt.",
                            ephemeral: true,
                        });
                        return;
                    }

                    const economy = await Economy.findOne({ userId });
                    if (!economy || economy.balance < item.price) {
                        await interaction.reply({
                            content: `Sie haben nicht genügend Münzen, um diesen Artikel zu kaufen.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    economy.balance -= item.price;
                    await economy.save();

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Kauf erfolgreich")
                        .setDescription(
                            `Sie haben **${item.name}** für **${item.price} Münzen** gekauft.`,
                        )
                        .setFooter({
                            text: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error("Error:", error);
                    await interaction.reply({
                        content: "Bei der Bearbeitung Ihres Kaufs ist ein Fehler aufgetreten.",
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "work") {
                const userId = interaction.user.id;
                const now = new Date();

                try {
                    let userEconomy = await Economy.findOne({ userId });
                    if (!userEconomy) {
                        await interaction.reply({
                            content:
                                "Sie haben kein Konto! Verwenden Sie /createaccount, um zu beginnen.",
                            ephemeral: true,
                        });
                        return;
                    }

                    if (
                        userEconomy.workCooldown &&
                        now.getTime() - userEconomy.workCooldown.getTime() < 3600000
                    ) {
                        const remaining =
                            3600000 - (now.getTime() - userEconomy.workCooldown.getTime());
                        await interaction.reply({
                            content: `Sie können in ${Math.ceil(remaining / 60000)} Minuten wieder arbeiten.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const earnings = Math.floor(Math.random() * 500) + 100;
                    userEconomy.balance += earnings;
                    userEconomy.workCooldown = now;
                    await userEconomy.save();

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Erfolg bei der Arbeit!")
                        .setDescription(`Sie haben **$${earnings}** verdient!`)
                        .setFooter({ text: `Neuer Kontostand: $${userEconomy.balance}` });

                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                } catch (error) {
                    console.error("Work command error:", error);
                    await interaction.reply({
                        content: "Während der Arbeit ist ein Fehler aufgetreten.",
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "withdraw") {
                try {
                    const userId = interaction.user.id;
                    const amount = interaction.options.getInteger("amount");

                    if (!amount || amount <= 0) {
                        await interaction.reply({
                            content: "Ungültiger Betrag.",
                            ephemeral: true,
                        });
                        return;
                    }

                    const economy = await Economy.findOne({ userId });

                    if (!economy || economy.balance < amount) {
                        await interaction.reply({
                            content: "Sie haben nicht genügend Münzen zum Abheben.",
                            ephemeral: true,
                        });
                        return;
                    }

                    economy.balance -= amount;
                    await economy.save();

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Auszahlung erfolgreich")
                        .setDescription(
                            `Sie haben **${amount} Münzen** von Ihrem Guthaben abgehoben.`,
                        )
                        .setFooter({
                            text: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error("Error:", error);
                    await interaction.reply({
                        content: "Bei der Bearbeitung Ihrer Auszahlung ist ein Fehler aufgetreten.",
                        ephemeral: true,
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
            await interaction.reply({
                content: "Beim Verarbeiten Ihres Befehls ist ein Fehler aufgetreten.",
                ephemeral: true,
            });
        }
    },
};

export default EconomyCommand;
