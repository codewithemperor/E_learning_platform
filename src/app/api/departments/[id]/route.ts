import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
    // Validate input
    const validatedData = departmentSchema.parse(body);
    
    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: {
        id,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if department code already exists (excluding current department)
    const codeExists = await db.department.findFirst({
      where: {
        code: validatedData.code,
        NOT: {
          id,
        },
      },
    });

    if (codeExists) {
      return NextResponse.json(
        { error: "Department with this code already exists" },
        { status: 400 }
      );
    }

    // Update department
    const department = await db.department.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update department" },
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
    
    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: {
        id,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check if department has related courses or teachers
    const relatedCourses = await db.course.count({
      where: {
        departmentId: id,
      },
    });

    const relatedTeachers = await db.teacher.count({
      where: {
        departmentId: id,
      },
    });

    if (relatedCourses > 0 || relatedTeachers > 0) {
      return NextResponse.json(
        { error: "Cannot delete department with related courses or teachers" },
        { status: 400 }
      );
    }

    // Delete department
    await db.department.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}