import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectFileId } = await context.params;
console.log({id: subjectFileId})
    // 1. Find subjectFile with fileUpload
    const subjectFile = await db.subjectFile.findUnique({
      where: { id: subjectFileId },
      include: { fileUpload: true },
    });

    if (!subjectFile) {
      return NextResponse.json(
        { error: 'Subject file not found' },
        { status: 404 }
      );
    }

    const fileUpload = subjectFile.fileUpload;

    // 2. Delete subjectFile first
    await db.subjectFile.delete({
      where: { id: subjectFileId },
    });

    // 3. Delete from Cloudinary if exists
    if (fileUpload?.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(fileUpload.cloudinaryPublicId);
    }

    // 4. Delete from fileUpload table (optional, only if exists)
    if (fileUpload) {
      await db.fileUpload.delete({
        where: { id: fileUpload.id },
      });
    }

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
