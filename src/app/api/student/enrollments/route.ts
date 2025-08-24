import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        subject: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Format the response
    const formattedEnrollments = enrollments.map((enrollment) => ({
      id: enrollment.id,
      subjectId: enrollment.subjectId,
      subjectName: enrollment.subject.name,
      subjectCode: enrollment.subject.code,
      semester: enrollment.subject.semester,
      courseName: enrollment.subject.course.name,
      departmentName: enrollment.subject.course.department.name,
      enrolledAt: enrollment.enrolledAt,
    }));

    return NextResponse.json(formattedEnrollments);
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch student enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, subjectIds } = await request.json();

    if (!studentId || !subjectIds || !Array.isArray(subjectIds)) {
      return NextResponse.json(
        { error: "Student ID and subject IDs array are required" },
        { status: 400 }
      );
    }

    // Delete existing enrollments for this student
    await db.enrollment.deleteMany({
      where: {
        studentId: studentId,
      },
    });

    // Create new enrollments
    const newEnrollments = await Promise.all(
      subjectIds.map((subjectId) =>
        db.enrollment.create({
          data: {
            studentId: studentId,
            subjectId: subjectId,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Enrollments updated successfully",
      count: newEnrollments.length,
    });
  } catch (error) {
    console.error("Error updating student enrollments:", error);
    return NextResponse.json(
      { error: "Failed to update student enrollments" },
      { status: 500 }
    );
  }
}