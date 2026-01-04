import { NextRequest, NextResponse } from 'next/server';
import { PromptStore, PromptId } from '@/lib/store/promptStore';

export async function GET(req: NextRequest) {
    try {
        const configs = PromptStore.getAllConfigs();
        return NextResponse.json(configs);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { id, template } = await req.json();

        if (!id || !template) {
            return NextResponse.json({ error: 'Missing id or template' }, { status: 400 });
        }

        PromptStore.updatePrompt(id as PromptId, template);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }
}
