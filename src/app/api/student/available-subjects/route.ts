import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");

    if (!courseId || !year || !semester) {
      return NextResponse.json(
        { error: "Course ID, year, and semester are required" },
        { status: 400 }
      );
    }

    const subjects = await db.subject.findMany({
      where: {
        courseId: courseId,
        semester: parseInt(semester),
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
      orderBy: {
        code: "asc",
      },
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
    console.error("Error fetching available subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch available subjects" },
      { status: 500 }
    );
  }
}