import { NextRequest, NextResponse } from 'next/server';
import { PromptStore } from '@/lib/store/promptStore';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
    try {
        const { identity, spine, flesh, aiStyle, generationModel } = await req.json();

        let prompt = PromptStore.getPrompt('bio_writer');

        // Format the data for the prompt
        const identityStr = `${identity.firstName} ${identity.lastName} from ${identity.location}, ${identity.country}`;
        const spineChildhood = spine.find((n: any) => n.slot === 'CHILDHOOD')?.id || 'Unknown';
        const spineFormative = spine.find((n: any) => n.slot === 'FORMATIVE')?.id || 'Unknown';
        const spineProfessional = spine.find((n: any) => n.slot === 'PROFESSIONAL')?.id || 'Unknown';
        const spineSenior = spine.find((n: any) => n.slot === 'SENIOR')?.id || '';
        const fleshEvents = flesh.map((e: any) => e.text).join('; ');

        prompt = prompt.split('{{identity}}').join(identityStr);
        
        let spineStr = `Childhood: ${spineChildhood}\n* Formative: ${spineFormative}\n* Professional: ${spineProfessional}`;
        if (spineSenior) spineStr += `\n* Senior: ${spineSenior}`;
        
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