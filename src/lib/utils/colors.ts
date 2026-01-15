
/**
 * Generates a deterministic HSL color string from a given string (e.g., UUID).
 * Uses a hash function to select Hue, keeping Saturation and Lightness constant for consistency.
 */
export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Hue: 0-360
    // Multiply by a large prime (137) to scatter hues for sequential strings (e.g. "Group A", "Group B")
    const h = Math.abs(hash * 137) % 360;
    // Saturation: 65-85% (Vibrant but not neon)
    const s = 70 + (Math.abs(hash) % 20);
    // Lightness: 40-60% (Readable against white, visible borders)
    const l = 45 + (Math.abs(hash) % 15);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Returns a lighter variant of the group color for backgrounds.
 */
export function stringToLightColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 80%, 96%)`; // Very light background
}
