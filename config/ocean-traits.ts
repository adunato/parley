export const OCEAN_DESCRIPTIONS = {
    openness: {
        very_low: "Finds comfort in the proven and predictable. Highly practical and grounded, though may struggle with ambiguity or abstract changes.",
        low: "Pragmatic and focused on the concrete. Efficient at executing established methods but may be skeptical of unnecessary innovation.",
        moderate: "Balances a pragmatic approach with healthy curiosity. Open to new ideas when they have clear utility.",
        high: "Imaginative and intellectually curious. Quickly grasps complex concepts but may occasionally prioritize novelty over practicality.",
        very_high: "Visionary and constantly seeking the new. Excellent at abstract thinking, though can sometimes become detached from immediate practicalities."
    },
    conscientiousness: {
        very_low: "Highly flexible and spontaneous. Excellent at improvising in the moment, but often struggles with structure, routine, and long-term follow-through.",
        low: "Relaxed about rules and schedules. Prioritizes the big picture and adaptability, though may overlook fine details or deadlines.",
        moderate: "Reliable and organized without being rigid. Capable of planning ahead while adjusting to unexpected changes.",
        high: "Disciplined and goal-oriented. Very effective at execution and planning, though may struggle to deviate from the plan when necessary.",
        very_high: "Perfectionistic and intensely driven. Produces flawless work and adheres strictly to standards, but risks rigidity and burnout."
    },
    extraversion: {
        very_low: "Self-sufficient and deeply contemplative. requires very little external stimulation, though may appear distant or unapproachable to others.",
        low: "Reserved and observant. Excels in solitary work and deep one-on-one connections, avoiding the distraction of large groups.",
        moderate: "Ambivert. Adaptable to social situations but protects their downtime. Can be social without needing to be the center of attention.",
        high: "Socially dynamic and engaging. Energizes others and networks easily, though may rely on external validation or struggle with solitude.",
        very_high: "Dominant and thrill-seeking. The life of the party with boundless social energy, but can be impulsive or domineering in conversation."
    },
    agreeableness: {
        very_low: "Tough-minded and competitive. Unafraid to make unpopular decisions or engage in conflict, though can come across as hostile or untrusting.",
        low: "Skeptical and guarded. Prioritizes objective facts and self-interest over social niceties, protecting them from being taken advantage of.",
        moderate: "Cooperative yet distinct. Balances the needs of the group with their own boundaries; kind but not a pushover.",
        high: "Trusting and helpful. Builds strong alliances and creates harmony, though may hesitate to criticize others or deliver bad news.",
        very_high: "Self-sacrificing and deeply empathetic. exceptional at caregiving and mediation, but risks suppressing their own needs to please others."
    },
    neuroticism: {
        very_low: "Unshakable and fearless. immune to stress and panic, though may occasionally underestimate risks or seem emotionally detached.",
        low: "Confident and resilient. Handles pressure well and recovers quickly from setbacks, rarely dwelling on negatives.",
        moderate: "Generally stable. Experiences a healthy range of emotions and usually copes well, but will feel the weight of significant stressors.",
        high: "Vigilant and passionate. Highly attuned to risks and problems, though often at the cost of peace of mind and relaxation.",
        very_high: "Intense and reactive. deeply sensitive to their environment and quick to detect threats, but frequently overwhelmed by emotional volatility."
    }
};

export function getOceanDescription(trait: keyof typeof OCEAN_DESCRIPTIONS, value: number): string {
    if (value <= 20) return OCEAN_DESCRIPTIONS[trait].very_low;
    if (value <= 40) return OCEAN_DESCRIPTIONS[trait].low;
    if (value <= 60) return OCEAN_DESCRIPTIONS[trait].moderate;
    if (value <= 80) return OCEAN_DESCRIPTIONS[trait].high;
    return OCEAN_DESCRIPTIONS[trait].very_high;
}
