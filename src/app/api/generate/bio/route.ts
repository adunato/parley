import { NextRequest, NextResponse } from 'next/server';
import { PromptStore } from '@/lib/store/promptStore';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
    try {
        const { identity, spine, flesh, aiStyle, generationModel } = await req.json();

        let prompt = PromptStore.getPrompt('bio_writer');

        // Format the data for the prompt
        const identityStr = `${identity.firstName} ${identity.lastName} from ${identity.location}, ${identity.country}`;

        const PHASES = ['CHILDHOOD', 'FORMATIVE', 'PROFESSIONAL', 'SENIOR'];

        // Group everything by phase
        const eventsByPhase: Record<string, string[]> = {};

        // 1. Process Spine
        spine.forEach((node: any) => {
            const phase = node.slot || 'UNKNOWN';
            if (!eventsByPhase[phase]) eventsByPhase[phase] = [];
            eventsByPhase[phase].push(node.text || node.id);
        });

        // 2. Process Flesh (now with generatedPhase)
        flesh.forEach((event: any) => {
            // Use generatedPhase if available, otherwise fallback (or skip/put in UNKNOWN)
            const phase = event.generatedPhase ? event.generatedPhase.toUpperCase() : 'UNKNOWN';
            if (!eventsByPhase[phase]) eventsByPhase[phase] = [];
            eventsByPhase[phase].push(event.text);
        });

        let lifeHistoryStr = '';
        PHASES.forEach(phase => {
            if (eventsByPhase[phase] && eventsByPhase[phase].length > 0) {
                // Capitalize for display
                const displayPhase = phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase();

                lifeHistoryStr += `\n*${displayPhase}*\n`;
                eventsByPhase[phase].forEach(txt => {
                    lifeHistoryStr += `${txt}\n`;
                });
            }
        });

        // Add any Unknown phase items if they exist (optional, but good for debugging)
        if (eventsByPhase['UNKNOWN'] && eventsByPhase['UNKNOWN'].length > 0) {
            lifeHistoryStr += `\n*Unknown Phase*\n`;
            eventsByPhase['UNKNOWN'].forEach(txt => {
                lifeHistoryStr += `${txt}\n`;
            });
        }

        prompt = prompt.split('{{identity}}').join(identityStr);
        prompt = prompt.split('{{spine}}').join(lifeHistoryStr);
        prompt = prompt.split('{{flesh}}').join('(Included above)');
        prompt = prompt.split('{{aiStyle}}').join(aiStyle || 'Standard');

        const WRAPPER_JSON = `{ "bio": string }`;
        prompt += `\n\nResponsive MUST be a JSON object: ${WRAPPER_JSON}`;

        const parsedResult = await generateJSON(prompt, generationModel);

        return NextResponse.json({ bio: parsedResult.bio });
    } catch (error) {
        console.error('Error generating bio:', error);
        return NextResponse.json({ error: 'Failed to generate bio' }, { status: 500 });
    }
}