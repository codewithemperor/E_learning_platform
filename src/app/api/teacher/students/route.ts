import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId"); // User ID
    const subjectId = searchParams.get("subjectId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await db.teacher.findUnique({
      where: { userId: teacherId }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    let whereClause;
    
    if (subjectId) {
      // Verify teacher teaches this subject
      const teacherSubject = await db.teacherSubject.findFirst({
        where: {
          teacherId: teacherId,
          subjectId: subjectId,
        },
      });

      if (!teacherSubject) {
        return NextResponse.json(
          { error: "You don't teach this subject" },
          { status: 403 }
        );
      }

      whereClause = {
        subjectId: subjectId,
      };
    } else {
      whereClause = {
        subject: {
          teachers: {
            some: {
              teacherId: teacherId,
            },
          },
        },
      };
    }

    const enrollments = await db.enrollment.findMany({
      where: whereClause,
      include: {
        subject: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Get the student details separately
    const studentIds = enrollments.map(e => e.studentId);
    const students = await db.student.findMany({
      where: {
        userId: {
          in: studentIds
        }
      },
      include: {
        user: true,
        department: true,
        course: true,
      }
    });

    // Map students to enrollments
    const formattedStudents = enrollments.map(enrollment => {
      const student = students.find(s => s.userId === enrollment.studentId);
      if (!student) return null;

      return {
        enrollmentId: enrollment.id,
        studentId: student.studentId,
        name: student.user.name,
        email: student.user.email,
        department: {
          name: student.department.name,
          code: student.department.code,
        },
        course: {
          name: student.course.name,
          code: student.course.code,
        },
        subject: {
          name: enrollment.subject.name,
          code: enrollment.subject.code,
        },
        year: student.year,
        semester: student.semester,
        enrolledAt: enrollment.enrolledAt,
      };
    }).filter(Boolean); // Remove null entries

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}