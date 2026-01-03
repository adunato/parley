import { AnalyzeTurn } from '@/lib/engine/analyst';
import { JudgeTurn } from '@/lib/engine/judge';
import { PRQC } from '@/lib/engine/rules';
import { JudgeResult } from '@/lib/engine/judge';

export async function POST(req: Request) {
    try {
        const { chatHistory, character, persona, currentRelationship, modelName } = await req.json();

        if (!chatHistory || !character || !persona || !currentRelationship) {
            return new Response(JSON.stringify({ error: "Missing required data" }), { status: 400 });
        }

        // 1. Analyst: Extract Signals
        const signals = await AnalyzeTurn(chatHistory, character, persona, modelName);

        console.log("--- ANALYST SIGNALS ---");
        console.log(JSON.stringify(signals, null, 2));

        if (signals.length === 0) {
            return new Response(JSON.stringify({
                delta: null,
                description: "No significant interaction detected."
            }), { status: 200 });
        }

        // 2. Judge: Calculate Delta
        // Transform relationship to PRQC if needed (it assumes type compatibility)
        const currentStats: PRQC = {
            satisfaction: currentRelationship.satisfaction,
            commitment: currentRelationship.commitment,
            intimacy: currentRelationship.intimacy,
            trust: currentRelationship.trust,
            passion: currentRelationship.passion
        };

        const judgment: JudgeResult = JudgeTurn(currentStats, signals);

        console.log("--- JUDGE RESULT ---");
        console.log(JSON.stringify(judgment, null, 2));
        console.log("--------------------");

        return new Response(JSON.stringify({
            delta: judgment.delta,
            description: judgment.description,
            signals: signals
        }), { status: 200 });

    } catch (error) {
        console.error("Engine Process Turn Error:", error);
        return new Response(JSON.stringify({ error: "Internal Engine Error" }), { status: 500 });
    }
}
