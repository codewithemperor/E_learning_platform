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

    // First, resolve the actual user ID
    let actualUserId = studentId;
    
    // Check if this is a student profile ID
    const studentProfile = await db.student.findUnique({
      where: { id: studentId },
      select: { userId: true }
    });
    
    if (studentProfile) {
      actualUserId = studentProfile.userId;
    } else {
      // Verify it's a valid user ID with student role
      const userWithStudent = await db.user.findUnique({
        where: { 
          id: studentId,
          role: "STUDENT"
        },
        include: { studentProfile: true }
      });
      
      if (!userWithStudent || !userWithStudent.studentProfile) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
    }

    // Fetch student subjects with all required information
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: actualUserId,
      },
      include: {
        subject: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            teachers: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Format the response with teacher information
    const formattedSubjects = enrollments.map((enrollment) => {
      // Get the first teacher for this subject (assuming one teacher per subject)
      const teacherSubject = enrollment.subject.teachers[0];
      
      return {
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        code: enrollment.subject.code,
        semester: enrollment.subject.semester,
        course: {
          id: enrollment.subject.course.id,
          name: enrollment.subject.course.name,
          code: enrollment.subject.course.code,
        },
        department: {
          id: enrollment.subject.course.department.id,
          name: enrollment.subject.course.department.name,
          code: enrollment.subject.course.department.code,
        },
        teacher: teacherSubject ? {
          user: {
            name: teacherSubject.teacher.name,
            email: teacherSubject.teacher.email,
          },
          teacherId: teacherSubject.teacher.id,
        } : null,
        enrolledAt: enrollment.enrolledAt,
      };
    });

    return NextResponse.json(formattedSubjects);
  } catch (error) {
    console.error("Error fetching student subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}