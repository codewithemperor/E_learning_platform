import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSchema, teacherProfileSchema } from "@/lib/validations";
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
    const profileData = teacherProfileSchema.parse(body.profile);
    
    // Check if teacher exists
    const existingTeacher = await db.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Check if teacher ID already exists (excluding current teacher)
    const teacherIdExists = await db.teacher.findFirst({
      where: {
        teacherId: profileData.teacherId,
        NOT: {
          id,
        },
      },
    });

    if (teacherIdExists) {
      return NextResponse.json(
        { error: "Teacher with this ID already exists" },
        { status: 400 }
      );
    }

    // Update user and teacher
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
          id: existingTeacher.userId,
        },
        data: updateData,
      });

      // Update teacher
      const teacher = await prisma.teacher.update({
        where: {
          id,
        },
        data: {
          teacherId: profileData.teacherId,
          departmentId: profileData.departmentId,
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
        },
      });

      return teacher;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating teacher:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update teacher" },
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
    
    // Check if teacher exists
    const existingTeacher = await db.teacher.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Check if teacher has related classes
    const relatedClasses = await db.class.count({
      where: {
        teacherId: id,
      },
    });

    if (relatedClasses > 0) {
      return NextResponse.json(
        { error: "Cannot delete teacher with assigned classes" },
        { status: 400 }
      );
    }

    // Delete teacher and user in a transaction
    await db.$transaction(async (prisma) => {
      await prisma.teacher.delete({
        where: {
          id,
        },
      });

      await prisma.user.delete({
        where: {
          id: existingTeacher.userId,
        },
      });
    });

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}