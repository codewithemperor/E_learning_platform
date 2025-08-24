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

    // Get teacher statistics
    const [
      totalSubjects,
      totalStudents,
      totalFiles,
      totalClasses
    ] = await Promise.all([
      // Total subjects
      db.teacherSubject.count({
        where: {
          teacherId: teacherId,
        },
      }),
      // Total students (unique)
      db.enrollment.findMany({
        where: {
          teacherSubject: {
            teacherId: teacherId,
          },
        },
        select: {
          studentId: true,
        },
        distinct: ["studentId"],
      }),
      // Total files
      db.subjectFile.count({
        where: {
          teacherSubject: {
            teacherId: teacherId,
          },
        },
      }),
      // Total classes (same as subjects)
      db.teacherSubject.count({
        where: {
          teacherId: teacherId,
        },
      }),
    ]);

    const stats = {
      totalClasses,
      totalStudents: totalStudents.length,
      totalFiles,
      totalVideoCalls: 0, // Placeholder for future video call feature
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching teacher dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}