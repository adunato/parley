import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const filePathComponents = params.path;
        if (!filePathComponents || filePathComponents.length === 0) {
            return new NextResponse('File not found', { status: 404 });
        }

        const filePath = path.join(process.cwd(), 'generated-images', ...filePathComponents);

        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';

        return new NextResponse(fileBuffer as any, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
