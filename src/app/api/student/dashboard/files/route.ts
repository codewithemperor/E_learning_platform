import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get student ID from session or query parameter
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch recent files from enrolled courses
    const files = await db.subjectFile.findMany({
      where: {
        subject: {
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
      },
      orderBy: {
        uploadedAt: "desc",
      },
      take: 10, // Limit to 10 recent files
    });

    // Format the response
    const formattedFiles = files.map((file) => ({
      id: file.id,
      title: file.title,
      course: file.subject.name,
      uploadedAt: file.uploadedAt,
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching student dashboard files:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard files" },
      { status: 500 }
    );
  }
}