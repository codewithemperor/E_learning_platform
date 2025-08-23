import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const uploadedBy = searchParams.get('uploadedBy');

    const whereClause: any = {};
    
    if (subjectId) {
      whereClause.subjectFiles = {
        some: {
          subjectId: subjectId
        }
      };
    }
    
    if (uploadedBy) {
      whereClause.uploadedBy = uploadedBy;
    }

    const files = await db.fileUpload.findMany({
      where: whereClause,
      include: {
        files: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    const formattedFiles = files.map(file => ({
      id: file.id,
      title: file.files[0]?.title || file.originalName,
      description: file.files[0]?.description,
      originalName: file.originalName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      cloudinaryUrl: file.cloudinaryUrl,
      uploadedAt: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      subject: file.files[0]?.subject
    }));

    return NextResponse.json({
      files: formattedFiles
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}