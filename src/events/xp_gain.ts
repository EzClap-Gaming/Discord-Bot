import { Client, Message, EmbedBuilder } from "discord.js";
import { LevelUtil } from "../utils/levelUtil";
import { Level } from "../models/Level";

export const handleXPListener = (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
        if (message.author.bot) return;

        try {
            const userId = message.author.id;
            const xpEarned = Math.floor(Math.random() * 10) + 5;

            await LevelUtil.giveUserXP(userId, xpEarned);

            const userData = await Level.findOne({ userId });
            if (!userData) {
                await Level.create({
                    userId,
                    xp: xpEarned,
                    level: 0,
                    levelUpCount: 0,
                    xpHistory: [{ date: new Date(), xpEarned }],
                });
            } else {
                userData.xp += xpEarned;
                userData.xpHistory.push({ date: new Date(), xpEarned });
                await userData.save();
            }

            if (Math.random() < 0.1) {
                const embed = new EmbedBuilder()
                    .setColor("#4CAF50")
                    .setTitle("🎉 **XP Earned!** 🎉")
                    .setDescription(
                        `💪 **Du hast** **${xpEarned}** XP verdient! 🎯\n\n` +
                            `Weiter so, chatte mehr und levele auf! 🚀\n\n` +
                            `Level up und schalte neue Funktionen frei! 🔓`,
                    )
                    .setFooter({ text: "Mach weiter und level auf! 🏅" })
                    .setTimestamp();

                const replyMessage = await message.reply({
                    embeds: [embed],
                });

                setTimeout(() => {
                    replyMessage.delete();
                }, 10000);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[XP Listener] Error: ${errorMessage}`);
        }
    });
};
