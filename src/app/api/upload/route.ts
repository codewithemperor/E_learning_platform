import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { unlinkSync, existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subjectId = formData.get('subjectId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileName = `${uuidv4()}-${file.name}`;
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFilePath = path.join(tempDir, fileName);

    // Ensure temp directory exists
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Write file to temporary location
    await writeFile(tempFilePath, buffer);

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: 'auto',
        folder: 'e-learning',
        use_filename: true,
        unique_filename: true,
      });

      // Save file info to database
      const fileUpload = await db.fileUpload.create({
        data: {
          filename: result.public_id,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          uploadedBy,
        },
      });

      // Create subject file entry
      if (subjectId) {
        await db.subjectFile.create({
          data: {
            subjectId,
            fileUploadId: fileUpload.id,
            title: title || file.name,
            description: description || '',
          },
        });
      }

      // Clean up temporary file
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }

      return NextResponse.json({
        message: 'File uploaded successfully',
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
          fileSize: fileUpload.fileSize,
          mimeType: fileUpload.mimeType,
          cloudinaryUrl: fileUpload.cloudinaryUrl,
          title: title || file.name,
        },
      });
    } catch (cloudinaryError) {
      // Clean up temporary file even if Cloudinary upload fails
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
      throw cloudinaryError;
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}