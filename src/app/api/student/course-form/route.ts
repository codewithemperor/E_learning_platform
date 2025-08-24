import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { departmentId, courseId, year, semester, studentId } = await request.json();

    if (!departmentId || !courseId || !year || !semester || !studentId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await db.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if department exists
    const department = await db.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Update student information
    const updatedStudent = await db.student.update({
      where: {
        id: studentId,
      },
      data: {
        departmentId,
        courseId,
        year,
        semester,
      },
      include: {
        user: true,
        department: true,
        course: true,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error submitting student course form:", error);
    return NextResponse.json(
      { error: "Failed to submit course form" },
      { status: 500 }
    );
  }
}