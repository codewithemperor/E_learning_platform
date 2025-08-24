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

    // Fetch student courses with progress
    const courses = await db.enrollment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        teacherSubject: {
          include: {
            subject: {
              include: {
                course: true,
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

    // Format the response with mock progress data
    const formattedCourses = courses.map((enrollment) => ({
      id: enrollment.teacherSubject.subject.id,
      name: enrollment.teacherSubject.subject.name,
      instructor: enrollment.teacherSubject.teacher.user.name,
      progress: Math.floor(Math.random() * 100), // Mock progress data
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Error fetching student dashboard courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard courses" },
      { status: 500 }
    );
  }
}