
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Hue: 0-360
    const h = Math.abs(hash) % 360;
    // Saturation: 65-85% (Vibrant but not neon)
    const s = 70 + (Math.abs(hash) % 20); 
    // Lightness: 40-60% (Readable against white, visible borders)
    const l = 45 + (Math.abs(hash) % 15);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

const groups = [
    "Group A", "Group B", "Group C", 
    "uuid-1", "uuid-2",
    "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "f47ac10b-58cc-4372-a567-0e02b2c3d480"
];

groups.forEach(g => {
    console.log(`${g}: ${stringToColor(g)}`);
});
