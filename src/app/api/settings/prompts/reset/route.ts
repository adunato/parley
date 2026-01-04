import { NextRequest, NextResponse } from 'next/server';
import { PromptStore, PromptId } from '@/lib/store/promptStore';

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        PromptStore.resetPrompt(id as PromptId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error resetting prompt:', error);
        return NextResponse.json({ error: 'Failed to reset prompt' }, { status: 500 });
    }
}
