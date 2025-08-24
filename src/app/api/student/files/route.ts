import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get student ID and subject ID from query parameters
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    let files;
    
    if (subjectId) {
      // Get files for a specific subject
      files = await db.subjectFile.findMany({
        where: {
          teacherSubject: {
            subjectId: subjectId,
            enrollments: {
              some: {
                studentId: studentId,
              },
            },
          },
        },
        include: {
          fileUpload: true,
          subject: true,
          teacherSubject: {
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    } else {
      // Get all files for this student's enrolled subjects
      files = await db.subjectFile.findMany({
        where: {
          teacherSubject: {
            enrollments: {
              some: {
                studentId: studentId,
              },
            },
          },
        },
        include: {
          fileUpload: true,
          subject: true,
          teacherSubject: {
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    }

    // Format the response to match the expected structure
    const formattedFiles = files.map((file) => ({
      id: file.id,
      title: file.title,
      description: file.description,
      uploadedAt: file.uploadedAt,
      fileUpload: file.fileUpload,
      subject: file.subject,
      teacher: file.teacherSubject.teacher,
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching student files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}