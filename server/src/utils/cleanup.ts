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
