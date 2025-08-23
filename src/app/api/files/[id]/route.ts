import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;

    // Get file info from database
    const fileUpload = await db.fileUpload.findUnique({
      where: { id: fileId },
    });

    if (!fileUpload) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (fileUpload.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(fileUpload.cloudinaryPublicId);
    }

    // Delete from database
    await db.fileUpload.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}