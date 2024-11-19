import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication first
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Find the file and verify ownership
    const file = await File.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    const filePath = join(process.cwd(), 'uploads', file.filename);
    if (!existsSync(filePath)) {
      return new NextResponse('File not found on disk', { status: 404 });
    }

    const fileContent = await readFile(filePath);

    // For text files, ensure we're sending UTF-8 encoded text
    if (file.mimeType.startsWith('text/') || file.mimeType === 'application/json') {
      return new NextResponse(fileContent.toString('utf-8'), {
        status: 200,
        headers: {
          'Content-Type': `${file.mimeType}; charset=utf-8`,
        },
      });
    }
    
    // For other files, send binary data with appropriate content type
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.originalName}"`,
      },
    });
  } catch (error) {
    console.error('Error previewing file:', error);
    return new NextResponse('Error previewing file', { status: 500 });
  }
}
