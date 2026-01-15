
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Hue: 0-360
    // Multiply by a prime to scatter the hues for sequential inputs
    const h = Math.abs(hash * 137) % 360;

    const s = 70 + (Math.abs(hash) % 20);
    const l = 45 + (Math.abs(hash) % 15);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

const groups = [
    "Group A", "Group B", "Group C",
    "uuid-1", "uuid-2",
];

groups.forEach(g => {
    console.log(`${g}: ${stringToColor(g)}`);
});
