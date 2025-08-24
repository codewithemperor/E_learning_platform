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

    // Fetch student subjects with teacher and course info
    const subjects = await db.enrollment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        teacherSubject: {
          include: {
            subject: {
              include: {
                course: true,
                department: true,
              },
            },
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Format the response
    const formattedSubjects = subjects.map((enrollment) => ({
      id: enrollment.teacherSubject.subject.id,
      name: enrollment.teacherSubject.subject.name,
      code: enrollment.teacherSubject.subject.code,
      semester: enrollment.teacherSubject.subject.semester,
      course: enrollment.teacherSubject.subject.course,
      department: enrollment.teacherSubject.subject.department,
      teacher: enrollment.teacherSubject.teacher,
      enrolledAt: enrollment.enrolledAt,
    }));

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching student subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}