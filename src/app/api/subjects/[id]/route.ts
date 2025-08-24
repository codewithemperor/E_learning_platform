import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjectSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
    // Validate input
    const validatedData = subjectSchema.parse(body);
    
    // Check if subject exists
    const existingSubject = await db.subject.findUnique({
      where: {
        id,
      },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if subject code already exists (excluding current subject)
    const codeExists = await db.subject.findFirst({
      where: {
        code: validatedData.code,
        courseId: validatedData.courseId,
        NOT: {
          id,
        },
      },
    });

    if (codeExists) {
      return NextResponse.json(
        { error: "Subject with this code already exists in this course" },
        { status: 400 }
      );
    }

    // Update subject
    const subject = await db.subject.update({
      where: {
        id,
      },
      data: validatedData,
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if subject exists
    const existingSubject = await db.subject.findUnique({
      where: {
        id,
      },
    });

    if (!existingSubject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if subject has related classes or enrollments
    const relatedClasses = await db.class.count({
      where: {
        subjectId: id,
      },
    });

    const relatedEnrollments = await db.enrollment.count({
      where: {
        subjectId: id,
      },
    });

    if (relatedClasses > 0 || relatedEnrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with related classes or enrollments" },
        { status: 400 }
      );
    }

    // Delete subject
    await db.subject.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}