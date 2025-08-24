import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSchema, studentProfileSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
    // Validate input
    const userData = userSchema.parse(body);
    const profileData = studentProfileSchema.parse(body.profile);
    
    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student ID already exists (excluding current student)
    const studentIdExists = await db.student.findFirst({
      where: {
        studentId: profileData.studentId,
        NOT: {
          id,
        },
      },
    });

    if (studentIdExists) {
      return NextResponse.json(
        { error: "Student with this ID already exists" },
        { status: 400 }
      );
    }

    // Update user and student
    const result = await db.$transaction(async (prisma) => {
      // Update user
      const updateData: any = {
        name: userData.name,
        email: userData.email,
      };

      // Only update password if provided
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 12);
      }

      const user = await prisma.user.update({
        where: {
          id: existingStudent.userId,
        },
        data: updateData,
      });

      // Update student
      const student = await prisma.student.update({
        where: {
          id,
        },
        data: {
          studentId: profileData.studentId,
          departmentId: profileData.departmentId,
          courseId: profileData.courseId,
          year: profileData.year,
          semester: profileData.semester,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          department: true,
          course: true,
        },
      });

      return student;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating student:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update student" },
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
    
    // Check if student exists
    const existingStudent = await db.student.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student has related enrollments
    const relatedEnrollments = await db.enrollment.count({
      where: {
        studentId: id,
      },
    });

    if (relatedEnrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete student with active enrollments" },
        { status: 400 }
      );
    }

    // Delete student and user in a transaction
    await db.$transaction(async (prisma) => {
      await prisma.student.delete({
        where: {
          id,
        },
      });

      await prisma.user.delete({
        where: {
          id: existingStudent.userId,
        },
      });
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}