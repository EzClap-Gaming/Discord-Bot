import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { Command } from '../../functions/handleCommands';
import { Economy } from '../../models/Economy';

interface ShopItem {
    name: string;
    price: number;
}

const shopItems: ShopItem[] = [
    { name: 'Bycicle', price: 1500 },
    { name: 'Console', price: 800 },
    { name: 'Computer', price: 7500 },
    { name: '10x Games', price: 220 },
    { name: 'Toyota Car', price: 45000 },
    { name: 'Mercedes Car', price: 82000 },
    { name: 'BMW Car', price: 68000 },
    { name: 'Porsche Car', price: 110000 },
    { name: 'Lamborghini Car', price: 280000 },
    { name: 'Pagani Car', price: 4000000 },
];

const EconomyCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Manage your economy system.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-coins')
                .setDescription('Add coins to a user.')
                .addUserOption(option =>
                    option.setName('target').setDescription('The user to add coins to.').setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('amount').setDescription('The amount of coins to add.').setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('Check your current balance.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bank')
                .setDescription('View your bank balance.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('bet')
                .setDescription('Bet money to win or lose!')
                .addIntegerOption(option => option.setName('amount').setDescription('The amount to bet').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('daily')
                .setDescription('Claim your daily reward.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('deposit')
                .setDescription('Deposit coins into your bank.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of coins to deposit.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Displays the top users by balance.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pay')
                .setDescription('Send coins to another user.')
                .addUserOption(option =>
                    option.setName('recipient')
                        .setDescription('The user you want to send coins to.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of coins to send.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('rob')
                .setDescription('Attempt to rob another user!')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to rob')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shop')
                .setDescription('Browse and purchase items from the shop.')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('The item you want to buy.')
                        .addChoices({ name: 'Golden Sword', value: 'Golden Sword' }, { name: 'Shield', value: 'Shield' }, { name: 'Health Potion', value: 'Health Potion' })
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('work')
                .setDescription('Arbeiten und verdienen Geld')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('withdraw')
                .setDescription('Geld abheben')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Betrag zum Abheben')
                        .setRequired(true)
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        const userId = interaction.user.id

        try {
            if (subcommand === 'add-coins') {
                if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                    return;
                }

                const target = interaction.options.getUser('target');
                const amount = interaction.options.getInteger('amount');

                if (!target || !amount || amount <= 0) {
                    await interaction.reply({ content: 'Invalid user or amount.', ephemeral: true });
                    return;
                }

                let economy = await Economy.findOne({ userId: target.id });

                if (!economy) {
                    economy = new Economy({ userId: target.id });
                }

                economy.balance += amount;
                await economy.save();

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Coins Added')
                    .setDescription(`💸 Successfully added **${amount} coins** to ${target.username}.`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'balance') {
                const userId = interaction.user.id;
                let economy = await Economy.findOne({ userId });

                if (!economy) {
                    economy = new Economy({ userId });
                    await economy.save();
                }

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Your Balance')
                    .setDescription(`💰 You currently have **${economy.balance} coins**.`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'bank') {
                const userId = interaction.user.id;
                const economy = await Economy.findOne({ userId });

                if (!economy) {
                    await interaction.reply({ content: 'You do not have an account yet.', ephemeral: true });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Bank Balance')
                    .addFields(
                        { name: 'Wallet Balance', value: `${economy.balance} coins`, inline: true },
                        { name: 'Bank Balance', value: `${economy.bankBalance || 0} coins`, inline: true },
                    )
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'bet') {
                const userId = interaction.user.id;
                const betAmount = interaction.options.getInteger('amount') || 0;

                if (betAmount <= 0) {
                    await interaction.reply({ content: 'You must bet a positive amount!', ephemeral: true });
                    return;
                }

                const userEconomy = await Economy.findOne({ userId });

                if (!userEconomy) {
                    await interaction.reply({
                        content: "You don't have an account! Use /createaccount to get started.",
                        ephemeral: true,
                    });
                    return;
                }

                if (userEconomy.balance < betAmount) {
                    await interaction.reply({ content: 'You do not have enough money to bet this amount.', ephemeral: true });
                    return;
                }

                const won = Math.random() < 0.5;
                const embed = new EmbedBuilder().setTimestamp();

                if (won) {
                    const winnings = betAmount * 2;
                    userEconomy.balance += betAmount;
                    embed
                        .setColor('Green')
                        .setTitle('You Won!')
                        .setDescription(`You bet **$${betAmount}** and won **$${winnings}**!`)
                        .setFooter({ text: `New Balance: $${userEconomy.balance}` });
                } else {
                    userEconomy.balance -= betAmount;
                    embed
                        .setColor('Red')
                        .setTitle('You Lost!')
                        .setDescription(`You bet **$${betAmount}** and lost it all.`)
                        .setFooter({ text: `New Balance: $${userEconomy.balance}` });
                }

                await userEconomy.save();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'daily') {
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

                if (lastDaily && now.getDate() === lastDaily.getDate() && now.getMonth() === lastDaily.getMonth() && now.getFullYear() === lastDaily.getFullYear()) {
                    await interaction.reply({ content: 'You have already claimed your daily reward today!', ephemeral: true });
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
                    .setColor('Yellow')
                    .setTitle('Daily Reward Claimed')
                    .setDescription(`🎉 You received **${totalReward} coins**!\nCurrent Streak: **${economy.dailyStreak} days**`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'deposit') {
                const userId = interaction.user.id;
                const amount = interaction.options.getInteger('amount');

                if (!amount || amount <= 0) {
                    await interaction.reply({ content: 'You must deposit a valid amount.', ephemeral: true });
                    return;
                }

                const economy = await Economy.findOne({ userId });

                if (!economy || economy.balance < amount) {
                    await interaction.reply({ content: 'You don’t have enough coins to deposit.', ephemeral: true });
                    return;
                }

                economy.balance -= amount;
                economy.bankBalance = (economy.bankBalance || 0) + amount;
                await economy.save();

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Deposit Successful')
                    .setDescription(`You deposited **${amount} coins** into your bank.`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'leaderboard') {
                const topUsers = await Economy.find()
                    .sort({ balance: -1 })
                    .limit(10);

                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('Top 10 Richest Users')
                    .setDescription(
                        topUsers
                            .map((user, index) => `**${index + 1}.** <@${user.userId}> - **${user.balance} coins**`)
                            .join('\n') || 'No users found.'
                    )
                    .setFooter({ text: 'Leaderboard', iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: false });
            } else if (subcommand === 'pay') {
                const recipient = interaction.options.getUser('recipient');
                const amount = interaction.options.getInteger('amount');
                const senderId = interaction.user.id;

                if (!recipient || !amount || amount <= 0) {
                    await interaction.reply({ content: 'Invalid recipient or amount.', ephemeral: true });
                    return;
                }

                if (recipient.id === senderId) {
                    await interaction.reply({ content: 'You cannot send coins to yourself.', ephemeral: true });
                    return;
                }

                const senderEconomy = await Economy.findOne({ userId: senderId });
                const recipientEconomy = await Economy.findOne({ userId: recipient.id });

                if (!senderEconomy || senderEconomy.balance < amount) {
                    await interaction.reply({ content: 'You do not have enough coins to complete this transaction.', ephemeral: true });
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
                    .setColor('Blue')
                    .setTitle('Payment Successful')
                    .setDescription(`You sent **${amount} coins** to **${recipient.username}**.`)
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else if (subcommand === 'rob') {
                const userId = interaction.user.id;
                const targetUser = interaction.options.getUser('target');

                if (!targetUser || targetUser.id === userId) {
                    await interaction.reply({
                        content: 'You cannot rob yourself or an invalid target.',
                        ephemeral: true,
                    });
                    return;
                }

                const now = new Date();

                try {
                    const userEconomy = await Economy.findOne({ userId });
                    const targetEconomy = await Economy.findOne({ userId: targetUser.id });

                    if (!userEconomy || !targetEconomy) {
                        await interaction.reply({
                            content: "Either you or the target doesn't have an account!",
                            ephemeral: true,
                        });
                        return;
                    }

                    if (userEconomy.robCooldown && now.getTime() - userEconomy.robCooldown.getTime() < 7200000) {
                        const remaining = 7200000 - (now.getTime() - userEconomy.robCooldown.getTime());
                        await interaction.reply({
                            content: `You can rob again in ${Math.ceil(remaining / 60000)} minutes.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    if (targetEconomy.balance < 100) {
                        await interaction.reply({
                            content: 'Your target does not have enough money to rob!',
                            ephemeral: true,
                        });
                        return;
                    }

                    const success = Math.random() < 0.5;
                    if (success) {
                        const stolenAmount = Math.floor(targetEconomy.balance * (Math.random() * 0.3));
                        targetEconomy.balance -= stolenAmount;
                        userEconomy.balance += stolenAmount;
                        userEconomy.robCooldown = now;

                        await targetEconomy.save();
                        await userEconomy.save();

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Green')
                                    .setTitle('Robbery Success!')
                                    .setDescription(`You successfully robbed **$${stolenAmount}** from ${targetUser.username}!`),
                            ],
                            ephemeral: true,
                        });
                    } else {
                        userEconomy.robCooldown = now;
                        await userEconomy.save();

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle('Robbery Failed!')
                                    .setDescription(`You were caught trying to rob ${targetUser.username} and failed miserably!`),
                            ],
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    console.error('Rob command error:', error);
                    await interaction.reply({ content: 'An error occurred while trying to rob.', ephemeral: true });
                }
            } else if (subcommand === 'shop') {
                try {
                    const selectedItem = interaction.options.getString('item');
        
                    if (!selectedItem) {
                        const embed = new EmbedBuilder()
                            .setColor('Yellow')
                            .setTitle('Shop Items')
                            .setDescription(
                                shopItems.map(item => `**${item.name}** - ${item.price} coins`).join('\n')
                            )
                            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
        
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }
        
                    const item = shopItems.find(i => i.name === selectedItem);
                    if (!item) {
                        await interaction.reply({ content: 'Invalid item selected.', ephemeral: true });
                        return;
                    }
        
                    const economy = await Economy.findOne({ userId });
                    if (!economy || economy.balance < item.price) {
                        await interaction.reply({ content: `You don't have enough coins to buy this item.`, ephemeral: true });
                        return;
                    }
        
                    economy.balance -= item.price;
                    await economy.save();
        
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Purchase Successful')
                        .setDescription(`You purchased **${item.name}** for **${item.price} coins**.`)
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp();
        
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('[Shop Command] Error:', error);
                    await interaction.reply({ content: 'An error occurred while processing your purchase.', ephemeral: true });
                }
            } else if (subcommand === 'work') {
                const userId = interaction.user.id;
                const now = new Date();

                try {
                    let userEconomy = await Economy.findOne({ userId });
                    if (!userEconomy) {
                        await interaction.reply({
                            content: "You don't have an account! Use /createaccount to get started.",
                            ephemeral: true,
                        });
                        return;
                    }

                    if (userEconomy.workCooldown && now.getTime() - userEconomy.workCooldown.getTime() < 3600000) {
                        const remaining = 3600000 - (now.getTime() - userEconomy.workCooldown.getTime());
                        await interaction.reply({
                            content: `You can work again in ${Math.ceil(remaining / 60000)} minutes.`,
                            ephemeral: true,
                        });
                        return;
                    }

                    const earnings = Math.floor(Math.random() * 500) + 100;
                    userEconomy.balance += earnings;
                    userEconomy.workCooldown = now;
                    await userEconomy.save();

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Work Success!')
                        .setDescription(`You earned **$${earnings}**!`)
                        .setFooter({ text: `New Balance: $${userEconomy.balance}` });

                    await interaction.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Work command error:', error);
                    await interaction.reply({ content: 'An error occurred while working.', ephemeral: true });
                }
            } else if (subcommand === 'withdraw') {
                try {
                    const userId = interaction.user.id;
                    const amount = interaction.options.getInteger('amount');
        
                    if (!amount || amount <= 0) {
                        await interaction.reply({ content: 'Invalid amount.', ephemeral: true });
                        return;
                    }
        
                    const economy = await Economy.findOne({ userId });
        
                    if (!economy || economy.balance < amount) {
                        await interaction.reply({ content: 'You do not have enough coins to withdraw.', ephemeral: true });
                        return;
                    }
        
                    economy.balance -= amount;
                    await economy.save();
        
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Withdrawal Successful')
                        .setDescription(`You withdrew **${amount} coins** from your balance.`)
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp();
        
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('[Withdraw Command] Error:', error);
                    await interaction.reply({ content: 'An error occurred while processing your withdrawal.', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('[Economy Command] Error:', error);
            await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
        }
    },
};

export default EconomyCommand;
