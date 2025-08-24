import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get teacher ID and subject ID from query parameters
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");
    const subjectId = searchParams.get("subjectId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    let students;
    
    if (subjectId) {
      // Get students for a specific subject that this teacher teaches
      students = await db.enrollment.findMany({
        where: {
          subjectId: subjectId,
          subject: {
            teacherSubjects: {
              some: {
                teacherId: teacherId
              }
            }
          }
        },
        include: {
          student: {
            include: {
              user: true,
              department: true,
              course: true,
            },
          },
        },
        orderBy: {
          enrolledAt: "desc",
        },
      });
    } else {
      // Get all students for this teacher across all their subjects
      students = await db.enrollment.findMany({
        where: {
          subject: {
            teacherSubjects: {
              some: {
                teacherId: teacherId
              }
            }
          }
        },
        include: {
          student: {
            include: {
              user: true,
              department: true,
              course: true,
            },
          },
        },
        orderBy: {
          enrolledAt: "desc",
        },
      });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}