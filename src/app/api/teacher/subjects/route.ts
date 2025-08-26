import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId"); // User ID

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await db.teacher.findUnique({
      where: { userId: teacherId }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
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
            course: {
              include: {
                department: true
              }
            },
            enrollments: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        subject: {
          name: "asc",
        },
      },
    });

    const formattedSubjects = teacherSubjects.map(ts => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      classCode: ts.classCode,
      course: ts.subject.course.name,
      department: ts.subject.course.department.name,
      semester: ts.subject.semester,
      enrollmentCount: ts.subject.enrollments.length,
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