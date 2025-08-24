import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // First, resolve the actual user ID
    let actualUserId = studentId;
    
    // Check if this is a student profile ID
    const studentProfile = await db.student.findUnique({
      where: { id: studentId },
      select: { userId: true }
    });
    
    if (studentProfile) {
      actualUserId = studentProfile.userId;
    } else {
      // Verify it's a valid user ID with student role
      const userWithStudent = await db.user.findUnique({
        where: { 
          id: studentId,
          role: "STUDENT"
        },
        include: { studentProfile: true }
      });
      
      if (!userWithStudent || !userWithStudent.studentProfile) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
    }

    let whereClause: any = {
      subject: {
        enrollments: {
          some: {
            studentId: actualUserId,
          },
        },
      },
    };

    // Add subject filter if provided
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const files = await db.subjectFile.findMany({
      where: whereClause,
      include: {
        fileUpload: true,
        subject: {
          include: {
            course: true,
            teachers: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    // Format the response to match the expected structure
    const formattedFiles = files.map((file) => {
      const teacherSubject = file.subject.teachers[0];
      return {
        id: file.id,
        title: file.title,
        description: file.description,
        uploadedAt: file.uploadedAt,
        fileUpload: {
          id: file.fileUpload.id,
          originalName: file.fileUpload.originalName,
          fileSize: file.fileUpload.fileSize,
          mimeType: file.fileUpload.mimeType,
          cloudinaryUrl: file.fileUpload.cloudinaryUrl || "#",
        },
        subject: {
          id: file.subject.id,
          name: file.subject.name,
          code: file.subject.code,
          classCode: `${file.subject.code}-${file.subject.semester}`,
        },
        teacher: teacherSubject ? {
          user: {
            name: teacherSubject.teacher.name,
          },
        } : {
          user: {
            name: "Unknown Instructor",
          },
        },
      };
    });

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching student files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}