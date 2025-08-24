import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSchema, studentProfileSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const students = await db.student.findMany({
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
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const userData = userSchema.parse(body);
    const profileData = studentProfileSchema.parse(body.profile);
    const subjectIds = body.subjects || [];
    
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

    // Check if student ID already exists
    const existingStudent = await db.student.findUnique({
      where: {
        studentId: profileData.studentId,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student with this ID already exists" },
        { status: 400 }
      );
    }

    // Verify that all subjects exist and belong to the selected course
    if (subjectIds.length > 0) {
      const subjects = await db.subject.findMany({
        where: {
          id: {
            in: subjectIds
          },
          courseId: profileData.courseId
        }
      });

      if (subjects.length !== subjectIds.length) {
        return NextResponse.json(
          { error: "One or more selected subjects are invalid" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user, student, and enrollments in a transaction
    const result = await db.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        },
      });

      const student = await prisma.student.create({
        data: {
          studentId: profileData.studentId,
          userId: user.id,
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

      // Create enrollments for selected subjects
      if (subjectIds.length > 0) {
        await prisma.enrollment.createMany({
          data: subjectIds.map((subjectId: string) => ({
            studentId: user.id,
            subjectId: subjectId
          }))
        });
      }

      return student;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}