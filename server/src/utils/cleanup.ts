import Tiffin from "../models/Tiffin.js";
import WeeklyMenu from "../models/WeeklyMenu.js";

/**
 * Check if a cutoff time has passed for today
 * @param cutoffTime - Time in "HH:MM" format
 * @returns true if current time is past the cutoff time
 */
export const isPastCutoff = (cutoffTime: string): boolean => {
    const now = new Date();
    const parts = cutoffTime.split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);

    const cutoffDate = new Date();
    cutoffDate.setHours(hours, minutes, 0, 0);

    return now > cutoffDate;
};

/**
 * Delete old weekly menus (older than 7 days)
 */
export const cleanupExpiredMenus = async (): Promise<void> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await WeeklyMenu.deleteMany({
            weekStartDate: { $lt: sevenDaysAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`🧹 Cleanup: Deleted ${result.deletedCount} old weekly menu(s)`);
        }
    } catch (error) {
        console.error("Error during weekly menu cleanup:", error);
    }
};

/**
 * Delete all tiffin items that are past their cutoff time
 * This function is designed to be called periodically (e.g., every hour)
 */
export const cleanupExpiredTiffins = async (): Promise<void> => {
    try {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        // Find all tiffins where cutoff time has passed
        const allTiffins = await Tiffin.find({ isAvailable: true });

        let deletedCount = 0;
        for (const tiffin of allTiffins) {
            if (isPastCutoff(tiffin.cutoffTime)) {
                await tiffin.deleteOne();
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`🧹 Cleanup: Deleted ${deletedCount} expired tiffin(s) at ${currentTime}`);
        }
    } catch (error) {
        console.error("Error during tiffin cleanup:", error);
    }
};

/**
 * Start the periodic cleanup job
 * Runs immediately on startup, then every hour
 */
export const startCleanupJob = (): void => {
    // Run cleanup immediately on startup
    console.log("🔄 Starting tiffin cleanup job...");
    cleanupExpiredTiffins();

    // Run tiffin cleanup every hour (3600000 ms)
    setInterval(cleanupExpiredTiffins, 60 * 60 * 1000);

    // Run menu cleanup every 24 hours
    cleanupExpiredMenus(); // Run once on startup
    setInterval(cleanupExpiredMenus, 24 * 60 * 60 * 1000);

    console.log("⏰ Cleanup jobs scheduled");
};
