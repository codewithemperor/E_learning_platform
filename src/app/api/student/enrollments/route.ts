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

    // First, verify if studentId is a User ID or Student profile ID
    let actualUserId = studentId;
    
    // Check if this is a student profile ID
    const studentProfile = await db.student.findUnique({
      where: { id: studentId },
      select: { userId: true }
    });
    
    if (studentProfile) {
      actualUserId = studentProfile.userId;
    } else {
      // Check if it's already a valid user ID with student profile
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

    // Validate that all subject IDs exist
    const existingSubjects = await db.subject.findMany({
      where: {
        id: {
          in: subjectIds
        }
      },
      select: { id: true }
    });

    const existingSubjectIds = existingSubjects.map(s => s.id);
    const invalidSubjectIds = subjectIds.filter(id => !existingSubjectIds.includes(id));

    if (invalidSubjectIds.length > 0) {
      return NextResponse.json(
        { 
          error: "Invalid subject IDs found", 
          invalidIds: invalidSubjectIds 
        },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Delete existing enrollments for this student
      await tx.enrollment.deleteMany({
        where: {
          studentId: actualUserId,
        },
      });

      // Create new enrollments
      const newEnrollments = await Promise.all(
        subjectIds.map((subjectId) =>
          tx.enrollment.create({
            data: {
              studentId: actualUserId,
              subjectId: subjectId,
            },
          })
        )
      );

      return newEnrollments;
    });

    return NextResponse.json({
      message: "Enrollments updated successfully",
      count: result.length,
    });
  } catch (error) {
    console.error("Error updating student enrollments:", error);
    
    // Provide more specific error messages
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid student ID or subject ID provided" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update student enrollments" },
      { status: 500 }
    );
  }
}