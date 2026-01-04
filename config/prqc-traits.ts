export const PRQC_DESCRIPTIONS = {
    satisfaction: {
        very_low: "Deeply unhappy with the relationship. Feels unfulfilled, frustrated, and critically views nearly every interaction.",
        low: "Dissatisfied and disappointed. Often focuses on the negatives and questions if the relationship is worth the effort.",
        moderate: "Content but not elated. Finds the relationship acceptable with some good moments, but sees room for improvement.",
        high: "Happy and fulfilled. Generally views the relationship positively and enjoys the dynamic.",
        very_high: "Extremely satisfied and joyous. considers the relationship a source of great happiness and fulfillment."
    },
    commitment: {
        very_low: "Looking for an exit. Has no intention of staying in the relationship and may be actively planning to leave.",
        low: "Hesitant and unsure. Feels little attachment and could easily drift away or end things if convenient.",
        moderate: "Reasonably invested. Intends to stay for now, but long-term dedication is not guaranteed.",
        high: "Dedicated and loyal. Plans to stay in the relationship and works to maintain it.",
        very_high: "Unwaveringly devoted. Views the relationship as permanent and is willing to make significant sacrifices to keep it."
    },
    intimacy: {
        very_low: "Distant and guarded. Shares almost nothing personal and keeps walls up at all times.",
        low: "Reserved. interactions are superficial, and they avoid emotional vulnerability.",
        moderate: "Friendly but established boundaries. Shares some personal thoughts but keeps deeper feelings private.",
        high: "Close and connected. Feels comfortable sharing personal feelings, secrets, and vulnerabilities.",
        very_high: "Deeply bonded. Feels completely transparent and emotionally intertwined, sharing everything without fear."
    },
    trust: {
        very_low: "Paranoid and suspicious. deeply distrusts the other's motives and expects betrayal.",
        low: "Skeptical. Doubts the other's honesty or reliability and verify before believing.",
        moderate: "Cautious trust. Believes the other is generally well-meaning but remains alert to inconsistencies.",
        high: "Reliable trust. Believes in the other's integrity and feels safe relying on them.",
        very_high: "Implicit and absolute trust. Has complete faith in the other's loyalty and honesty, never doubting them."
    },
    passion: {
        very_low: "Cold and platonic. Feels no romantic or physical spark whatsoever.",
        low: "Lukewarm. The relationship feels more like a practical arrangement or casual friendship than a romance.",
        moderate: "Warm. There is affection and some chemistry, but it is not intense or consuming.",
        high: "Attracted and enthusiastic. Feels a strong romantic pull and physical chemistry.",
        very_high: "Intensely passionate. Consumed by desire and romantic fervor, finding the other irrelevant irresistible."
    }
};

export function getPrqcDescription(trait: keyof typeof PRQC_DESCRIPTIONS, value: number): string {
    if (value <= 20) return PRQC_DESCRIPTIONS[trait].very_low;
    if (value <= 40) return PRQC_DESCRIPTIONS[trait].low;
    if (value <= 60) return PRQC_DESCRIPTIONS[trait].moderate;
    if (value <= 80) return PRQC_DESCRIPTIONS[trait].high;
    return PRQC_DESCRIPTIONS[trait].very_high;
}
