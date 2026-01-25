import { NextRequest, NextResponse } from 'next/server';
import { PromptStore } from '@/lib/store/promptStore';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
    try {
        const { identity, spine, flesh, aiStyle, generationModel } = await req.json();

        let prompt = PromptStore.getPrompt('bio_writer');

        // Format the data for the prompt
        const fleshEvents = flesh.map((e: any) => e.text).join('; ');
        const identityStr = `${identity.firstName} ${identity.lastName} from ${identity.location}, ${identity.country}`;

        // Sort spine by phase order if needed, but usually they come in order or can be mapped by known phases
        const PHASES = ['CHILDHOOD', 'FORMATIVE', 'PROFESSIONAL', 'SENIOR'];

        // Group spine nodes by phase to handle multiple entries per phase (e.g. concurrent tracks)
        const spineByPhase: Record<string, string[]> = {};

        spine.forEach((node: any) => {
            const phase = node.slot || 'UNKNOWN';
            if (!spineByPhase[phase]) spineByPhase[phase] = [];
            // Use text if available, otherwise fallback to id (but text should be there)
            spineByPhase[phase].push(node.text || node.id);
        });

        let spineStr = '';
        PHASES.forEach(phase => {
            if (spineByPhase[phase] && spineByPhase[phase].length > 0) {
                // Capitalize first letter for display (e.g. CHILDHOOD -> Childhood)
                const displayPhase = phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase();
                // Join multiple events in the same phase with a space
                spineStr += `* ${displayPhase}: ${spineByPhase[phase].join(' ')}\n`;
            }
        });

        prompt = prompt.split('{{identity}}').join(identityStr);
        prompt = prompt.split('{{spine}}').join(spineStr);
        prompt = prompt.split('{{flesh}}').join(fleshEvents);
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