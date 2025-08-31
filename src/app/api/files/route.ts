import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const uploadedBy = searchParams.get('uploadedBy');

    const whereClause: any = {};
    
    if (subjectId) {
      whereClause.files = {
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
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    const formattedFiles = files.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      cloudinaryUrl: file.cloudinaryUrl,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
      uploader: {
        name: file.user.name,
        email: file.user.email
      },
      subjectFiles: file.files.map(sf => ({
        subject: {
          name: sf.subject.name,
          code: sf.subject.code
        }
      }))
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}