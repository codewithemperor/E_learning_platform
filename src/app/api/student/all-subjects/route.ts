import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const subjects = await db.subject.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        enrollments: {
          select: {
            studentId: true,
          },
        },
      },
      orderBy: [
        { semester: "asc" },
        { code: "asc" },
      ],
    });

    // Format the response
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
      courseName: subject.course.name,
      departmentName: subject.course.department.name,
      enrollmentCount: subject.enrollments.length,
    }));

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching all subjects for course:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects for course" },
      { status: 500 }
    );
  }
}