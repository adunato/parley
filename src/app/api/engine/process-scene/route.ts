import { AnalyzeScene } from '@/lib/engine/analyst';
import { JudgeScene } from '@/lib/engine/judge';
import { PRQC } from '@/lib/types';
import { JudgeResult } from '@/lib/engine/judge';

export async function POST(req: Request) {
    try {
        const { chatHistory, character, persona, currentRelationship, modelName } = await req.json();

        if (!chatHistory || !character || !persona || !currentRelationship) {
            return new Response(JSON.stringify({ error: "Missing required data" }), { status: 400 });
        }

        // 1. Analyst: Extract Scene Report (Aggregate Traits & Events)
        const sceneReport = await AnalyzeScene(chatHistory, character, persona, modelName);

        console.log("--- ANALYST SCENE REPORT ---");
        console.log(JSON.stringify(sceneReport, null, 2));

        if (Object.keys(sceneReport.aggregate_traits).length === 0) {
            return new Response(JSON.stringify({
                delta: null,
                description: "No significant interaction detected."
            }), { status: 200 });
        }

        // 2. Judge: Calculate Delta using Math Engine
        // Transform relationship to PRQC if needed (it assumes type compatibility)
        const currentStats: PRQC = {
            satisfaction: currentRelationship.satisfaction,
            commitment: currentRelationship.commitment,
            intimacy: currentRelationship.intimacy,
            trust: currentRelationship.trust,
            passion: currentRelationship.passion
        };

        const judgment: JudgeResult = JudgeScene(currentStats, sceneReport, character);

        console.log("--- JUDGE RESULT ---");
        console.log(JSON.stringify(judgment, null, 2));
        console.log("--------------------");

        return new Response(JSON.stringify({
            delta: judgment.delta,
            description: judgment.description,
            sceneReport: sceneReport,
            applied_traits: judgment.applied_traits
        }), { status: 200 });

    } catch (error) {
        console.error("Engine Process Scene Error:", error);
        return new Response(JSON.stringify({ error: "Internal Engine Error" }), { status: 500 });
    }
}
