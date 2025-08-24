import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    const whereClause = departmentId ? {
      departmentId,
    } : {};

    const courses = await db.course.findMany({
      where: whereClause,
      include: {
        department: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = courseSchema.parse(body);
    
    // Check if course code already exists
    const existingCourse = await db.course.findUnique({
      where: {
        code: validatedData.code,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course with this code already exists" },
        { status: 400 }
      );
    }

    // Create course
    const course = await db.course.create({
      data: validatedData,
      include: {
        department: true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}