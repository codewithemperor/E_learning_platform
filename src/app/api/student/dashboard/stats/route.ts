import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get student ID from session or query parameter
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get student statistics
    const [
      enrolledCourses,
      availableFiles,
      downloads,
      weeklyClasses
    ] = await Promise.all([
      // Total enrolled courses
      db.enrollment.count({
        where: {
          studentId: studentId,
        },
      }),
      // Available files in enrolled courses
      db.subjectFile.count({
        where: {
          subject: {
            enrollments: {
              some: {
                studentId: studentId,
              },
            },
          },
        },
      }),
      // Download count (mock data - would need a downloads table)
      0,
      // Weekly classes (mock data - would need a schedule table)
      0,
    ]);

    const stats = {
      enrolledCourses,
      availableFiles,
      downloads,
      weeklyClasses,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}