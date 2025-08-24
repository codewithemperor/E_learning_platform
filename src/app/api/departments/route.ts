import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const departments = await db.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = departmentSchema.parse(body);
    
    // Check if department code already exists
    const existingDepartment = await db.department.findUnique({
      where: {
        code: validatedData.code,
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: "Department with this code already exists" },
        { status: 400 }
      );
    }

    // Create department
    const department = await db.department.create({
      data: validatedData,
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}