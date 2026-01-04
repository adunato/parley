export const OCEAN_DESCRIPTIONS = {
    openness: {
        very_low: "Has a strong preference for routine and familiarity. Generally resistant to new ideas and rarely engages in abstract or theoretical thinking.",
        low: "Prefers the practical and concrete over the abstract. Tends to stick to established methods and values tradition.",
        moderate: "Balances a pragmatic approach with some curiosity. Open to new experiences but grounded in reality.",
        high: "Curious and imaginative. Enjoys exploring new concepts, values aesthetic experiences, and embraces change.",
        very_high: "Extremely creative and adventurous. Constructively challenges the status quo and is constantly seeking novel experiences and intellectual stimulation."
    },
    conscientiousness: {
        very_low: "Spontaneous and impulsive. Often disorganized and dislikes sticking to schedules or detailed plans.",
        low: "Flexible and relaxed about rules and deadlines. May overlook details in favor of the big picture or immediate gratification.",
        moderate: "Reliably dependable but not rigid. Can follow a schedule while adapting to unforeseen changes.",
        high: "Disciplined, organized, and vigilant. Values order, duty, and achievement, often planning strictly ahead.",
        very_high: "Extremely meticulous and driven. Strives for perfection, adheres strictly to rules, and has an intense focus on long-term goals."
    },
    extraversion: {
        very_low: "Deeply introverted and reserved. prefers solitude and finds social interactions draining.",
        low: "Quiet and reflective. Tends to listen rather than speak and enjoys small, intimate gatherings over large crowds.",
        moderate: "Ambivert. Comfortable in social situations but also values alone time to recharge.",
        high: "Outgoing and energetic. Enjoys being the center of attention and feels energized by social interaction.",
        very_high: "Extremely gregarious and assertive. Seeks constant social stimulation and is often the life of the party."
    },
    agreeableness: {
        very_low: "Competitive and challenging. Often sceptical of others' motives and is not afraid of conflict.",
        low: "Assertive and guarded. Prioritizes self-interest or objective truth over maintaining social harmony.",
        moderate: "Generally cooperative but willing to stand up for themselves. Balances kindness with a healthy degree of skepticism.",
        high: "Compassionate and cooperative. Values harmony, trusts others easily, and is often eager to help.",
        very_high: "Extremely altruistic and empathetic. Goes to great lengths to avoid conflict and ensure others' well-being, sometimes at their own expense."
    },
    neuroticism: {
        very_low: "Unflappable and emotionally stable. Remains calm and composed even in extremely stressful situations.",
        low: "Confident and resilient. Generally relaxed and does not worry easily.",
        moderate: "Generally stable but can feel stressed or anxious in difficult situations.",
        high: "Sensitive and prone to worry. Experiences emotions intensely and may struggle to cope with stress.",
        very_high: "Highly volatile and reactive. Frequently experiences anxiety, anger, or sadness and can be overwhelmed by minor stressors."
    }
};

export function getOceanDescription(trait: keyof typeof OCEAN_DESCRIPTIONS, value: number): string {
    if (value <= 20) return OCEAN_DESCRIPTIONS[trait].very_low;
    if (value <= 40) return OCEAN_DESCRIPTIONS[trait].low;
    if (value <= 60) return OCEAN_DESCRIPTIONS[trait].moderate;
    if (value <= 80) return OCEAN_DESCRIPTIONS[trait].high;
    return OCEAN_DESCRIPTIONS[trait].very_high;
}
