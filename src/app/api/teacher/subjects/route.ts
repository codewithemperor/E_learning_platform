import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get teacher ID from session or query parameter
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Fetch teacher subjects
    const teacherSubjects = await db.teacherSubject.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        subject: {
          include: {
            course: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to match the expected interface
    const formattedSubjects = teacherSubjects.map(ts => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      classCode: ts.classCode
    }));

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}