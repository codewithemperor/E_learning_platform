import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get teacher ID from session or query parameter
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Fetch recent classes with enrollment counts
    const classes = await db.teacherSubject.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        subject: {
          include: {
            course: true,
            department: true,
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, // Limit to 5 recent classes
    });

    // Format the response
    const formattedClasses = classes.map((classItem) => ({
      id: classItem.id,
      name: `${classItem.subject.name} (${classItem.subject.code})`,
      studentCount: classItem.enrollments.length,
      time: `${classItem.subject.course.name} - ${classItem.subject.department.name}`,
      subject: classItem.subject.name,
      students: classItem.enrollments.length,
    }));

    return NextResponse.json(formattedClasses);
  } catch (error) {
    console.error("Error fetching teacher dashboard classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard classes" },
      { status: 500 }
    );
  }
}