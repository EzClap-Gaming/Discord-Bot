import { Level } from "../models/Level";

export class LevelUtil {
    /**
     * Calculates the level based on the XP.
     * @param xp The user's experience points.
     * @returns The calculated level of the user.
     */
    static calculateLevel(xp: number): number {
        return Math.floor(xp / 100);
    }

    /**
     * Calculates the XP required for the next level.
     * @param level The current level of the user.
     * @returns The XP required for the next level.
     */
    static calculateNextLevelXp(level: number): number {
        return (level + 1) * 100;
    }

    /**
     * Retrieves the level data of a user by their user ID.
     * @param userId The user ID.
     * @returns An object with the user's level data, or null if no data is found.
     */
    static async getUserLevelData(userId: string) {
        const userData = await Level.findOne({ userId });
        if (!userData) return null;

        const level = this.calculateLevel(userData.xp);
        const nextLevelXp = this.calculateNextLevelXp(level);

        return {
            level,
            xp: userData.xp,
            nextLevelXp,
        };
    }

    /**
     * Grants XP to a user and updates their level.
     * @param userId The user ID.
     * @param xp The experience points to add to the user.
     */
    static async giveUserXP(userId: string, xp: number) {
        let userData = await Level.findOne({ userId });

        if (!userData) {
            userData = new Level({ userId, xp: 0, level: 0, levelUpCount: 0 });
        }

        userData.xp += xp;
        const previousLevel = userData.level;
        const newLevel = this.calculateLevel(userData.xp);

        if (newLevel > previousLevel) {
            userData.levelUpCount += 1;
        }

        userData.level = newLevel;

        await userData.save();
    }

    /**
     * Retrieves the top 10 users based on their level and XP.
     * @returns An array of the top 10 users, sorted by level and XP.
     */
    static async getLeaderboardData() {
        const leaderboard = await Level.find().sort({ level: -1, xp: -1 }).limit(10);

        return leaderboard.map((user) => ({
            userId: user.userId,
            level: user.level,
            xp: user.xp,
            username: user.userId, // You could return the username here instead of the userId
        }));
    }
}
