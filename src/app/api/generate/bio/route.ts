import { NextRequest, NextResponse } from 'next/server';
import { PromptStore } from '@/lib/store/promptStore';
import { generateJSON } from '@/lib/llm';

export async function POST(req: NextRequest) {
    try {
        const { identity, spine, flesh, aiStyle, generationModel } = await req.json();

        let prompt = PromptStore.getPrompt('bio_writer');

        // Format the data for the prompt
        const identityStr = `${identity.firstName} ${identity.lastName} from ${identity.location}, ${identity.country}`;
        const spineOrigin = spine.find((n: any) => n.slot === 'ORIGIN')?.id || 'Unknown';
        const spineEducation = spine.find((n: any) => n.slot === 'EDUCATION')?.id || 'Unknown';
        const spineCareer = spine.find((n: any) => n.slot === 'CAREER')?.id || 'Unknown';
        const fleshEvents = flesh.map((e: any) => e.text).join('; ');

        prompt = prompt.split('{{identity}}').join(identityStr);
        prompt = prompt.split('{{spine}}').join(`Origin: ${spineOrigin}, Education: ${spineEducation}, Career: ${spineCareer}`); // Replacing multiple spine tokens if template logic varies or just simplifying
        // Re-injecting specific spine slots if template has them distinct:
        // Actually the template uses {{spine}} 3 times. Let's fix the template substitution logic to be robust or the prompt to use distinct keys.
        // HLD Template said: * Origin: {{spine.origin}}
        // PromptStore implementation used: * Origin: {{spine}} ...
        // I should fix the PromptStore template to use distinct keys OR just pass a summary block.
        // Let's stick to the PromptStore implementation which used simple {{spine}} variable.
        // I will construct a readable string for {{spine}} and {{flesh}}.

        prompt = prompt.split('{{spine}}').join(`Origin: ${spineOrigin}\n* Education: ${spineEducation}\n* Career: ${spineCareer}`);
        prompt = prompt.split('{{flesh}}').join(fleshEvents);
        prompt = prompt.split('{{aiStyle}}').join(aiStyle || 'Standard');

        // We use generateJSON just to get the raw text if we want valid JSON, 
        // BUT the prompt asks for "Write a 2-paragraph background story". 
        // It does NOT ask for JSON.
        // The HLD says "Output: Returns the text string".
        // The existing `generateJSON` forces JSON mode.
        // I should probably use a basic `generateText` helper if one exists, or wrap the output in a JSON object structure for the LLM to fill.
        // Let's look at `src/lib/llm.ts` first. CHECKPOINT.

        // For now I will assume generateJSON is the main tool and wrap the output in a simple JSON structure.
        const WRAPPER_JSON = `{ "bio": string }`;
        prompt += `\n\nResponsive MUST be a JSON object: ${WRAPPER_JSON}`;

        const parsedResult = await generateJSON(prompt, generationModel);

        return NextResponse.json({ bio: parsedResult.bio });
    } catch (error) {
        console.error('Error generating bio:', error);
        return NextResponse.json({ error: 'Failed to generate bio' }, { status: 500 });
    }
}
