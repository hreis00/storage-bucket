import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
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

    // Delete the physical file
    const filePath = join(process.cwd(), 'uploads', file.filename);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete the database record
    await File.deleteOne({ _id: file._id });

    return new NextResponse('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    return new NextResponse('Error deleting file', { status: 500 });
  }
}
