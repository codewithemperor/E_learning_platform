import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = courseSchema.parse(body);
    
    // Check if course code already exists (excluding current course)
    const existingCourse = await db.course.findFirst({
      where: {
        code: validatedData.code,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 400 }
      );
    }

    // Update course
    const course = await db.course.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        department: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if course has subjects or students
    const subjectsCount = await db.subject.count({
      where: {
        courseId: params.id,
      },
    });

    const studentsCount = await db.student.count({
      where: {
        courseId: params.id,
      },
    });

    if (subjectsCount > 0 || studentsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete course that has subjects or students enrolled" },
        { status: 400 }
      );
    }

    // Delete course
    await db.course.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}