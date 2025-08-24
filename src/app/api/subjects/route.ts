import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjectSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const departmentId = searchParams.get("departmentId");

    let whereClause = {};
    if (courseId) {
      whereClause = { courseId };
    } else if (departmentId) {
      whereClause = {
        course: {
          departmentId: departmentId
        }
      };
    }

    const subjects = await db.subject.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = subjectSchema.parse(body);
    
    // Check if subject code already exists
    const existingSubject = await db.subject.findFirst({
      where: {
        code: validatedData.code,
        courseId: validatedData.courseId,
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject with this code already exists in this course" },
        { status: 400 }
      );
    }

    // Create subject
    const subject = await db.subject.create({
      data: validatedData,
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}