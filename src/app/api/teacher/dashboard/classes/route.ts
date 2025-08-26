import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId"); // User ID

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

    const teacherClasses = await db.teacherSubject.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        subject: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            enrollments: true, // Just get the enrollment IDs and studentIds
          },
        },
      },
      orderBy: {
        subject: {
          name: "asc",
        },
      },
    });

    // Get all student details separately
    const allStudentIds = teacherClasses.flatMap(tc => 
      tc.subject.enrollments.map(e => e.studentId)
    );
    
    const students = await db.student.findMany({
      where: {
        userId: {
          in: allStudentIds
        }
      },
      include: {
        user: true,
        department: true,
        course: true,
      }
    });

    const formattedClasses = teacherClasses.map(tc => {
      const enrollmentsWithStudents = tc.subject.enrollments.map(enrollment => {
        const student = students.find(s => s.userId === enrollment.studentId);
        if (!student) return null;

        return {
          id: enrollment.id,
          student: {
            id: student.id,
            studentId: student.studentId,
            name: student.user.name,
            email: student.user.email,
            year: student.year,
            semester: student.semester,
            department: {
              name: student.department.name,
              code: student.department.code,
            },
            course: {
              name: student.course.name,
              code: student.course.code,
            },
          },
          enrolledAt: enrollment.enrolledAt,
        };
      }).filter(Boolean);

      return {
        id: tc.id,
        classCode: tc.classCode,
        subject: {
          id: tc.subject.id,
          name: tc.subject.name,
          code: tc.subject.code,
          semester: tc.subject.semester,
          description: tc.subject.description,
        },
        course: {
          name: tc.subject.course.name,
          code: tc.subject.course.code,
        },
        department: {
          name: tc.subject.course.department.name,
          code: tc.subject.course.department.code,
        },
        enrollments: enrollmentsWithStudents,
        studentCount: enrollmentsWithStudents.length,
      };
    });

    return NextResponse.json(formattedClasses);
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}