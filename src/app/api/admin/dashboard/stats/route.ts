import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get admin statistics
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalDepartments,
      totalFiles,
      totalSubjects
    ] = await Promise.all([
      // Total students
      db.student.count(),
      // Total teachers
      db.teacher.count(),
      // Total courses
      db.course.count(),
      // Total departments
      db.department.count(),
      // Total files
      db.fileUpload.count(),
      // Total subjects
      db.subject.count(),
    ]);

    const stats = {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalDepartments,
      totalFiles,
      totalSubjects,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}