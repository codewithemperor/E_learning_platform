import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSchema, teacherProfileSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const teachers = await db.teacher.findMany({
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
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const userData = userSchema.parse(body);
    const profileData = teacherProfileSchema.parse(body.profile);
    const subjects = body.subjects || [];
    
    // Check if user email already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if teacher ID already exists
    const existingTeacher = await db.teacher.findUnique({
      where: {
        teacherId: profileData.teacherId,
      },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher with this ID already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user and teacher in a transaction
    const result = await db.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        },
      });

      const teacher = await prisma.teacher.create({
        data: {
          teacherId: profileData.teacherId,
          userId: user.id,
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

      // Create teacher-subject assignments for selected subjects
      if (subjects.length > 0) {
        for (const subjectId of subjects) {
          const subject = await prisma.subject.findUnique({
            where: { id: subjectId }
          });

          if (subject) {
            await prisma.teacherSubject.create({
              data: {
                teacherId: user.id,
                subjectId: subject.id,
                classCode: `${profileData.teacherId}-${subject.code}`
              }
            });
          }
        }
      }

      return teacher;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}