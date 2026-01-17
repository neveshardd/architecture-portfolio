import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const media = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    // Get media info before deleting
    const media = await prisma.media.findUnique({
      where: { id: parseInt(id) }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: parseInt(id) }
    });

    // Delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', media.url);
      await unlink(filepath);
    } catch (fileError) {
      console.warn('File deletion failed (may not exist):', fileError);
      // Continue even if file deletion fails
    }

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
