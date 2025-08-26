import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId"); // This should be the User ID

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Verify that this user is actually a teacher
    const teacher = await db.teacher.findUnique({
      where: { userId: teacherId },
      include: { 
        user: true,
        department: true 
      }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Fetch all dashboard data in parallel
    const [
      teacherSubjects,
      allEnrollments,
      allFiles,
    ] = await Promise.all([
      // Get teacher's subjects
      db.teacherSubject.findMany({
        where: {
          teacherId: teacherId, // This is the User ID
        },
        include: {
          subject: {
            include: {
              course: {
                include: {
                  department: true
                }
              },
              enrollments: {
                select: {
                  id: true,
                }
              },
            },
          },
        },
        orderBy: {
          subject: {
            name: "asc",
          },
        },
      }),

      // Get all enrollments for teacher's subjects (simplified)
      db.enrollment.findMany({
        where: {
          subject: {
            teachers: {
              some: {
                teacherId: teacherId,
              },
            },
          },
        },
        include: {
          subject: true,
        },
        orderBy: {
          enrolledAt: "desc",
        },
      }),

      // Get all files for teacher's subjects
      db.subjectFile.findMany({
        where: {
          subject: {
            teachers: {
              some: {
                teacherId: teacherId,
              },
            },
          },
        },
        include: {
          fileUpload: true,
          subject: true,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      }),
    ]);

    // Calculate stats
    const totalStats = {
      totalSubjects: teacherSubjects.length,
      totalStudents: allEnrollments.length, // Count of enrollments, not unique students
      totalFiles: allFiles.length,
    };

    // Format recent classes (limit to 5)
    const recentClasses = teacherSubjects.slice(0, 5).map((classItem) => ({
      id: classItem.id,
      name: `${classItem.subject.name} (${classItem.subject.code})`,
      studentCount: classItem.subject.enrollments.length,
      time: `${classItem.subject.course.name} - ${classItem.subject.course.department.name}`,
      subject: classItem.subject.name,
      students: classItem.subject.enrollments.length,
      classCode: classItem.classCode,
    }));

    // Format subjects list
    const subjects = teacherSubjects.map((ts) => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      classCode: ts.classCode,
      course: ts.subject.course.name,
      department: ts.subject.course.department.name,
      enrollmentCount: ts.subject.enrollments.length,
    }));

    // Get student details separately for enrollments
    const studentUserIds = [...new Set(allEnrollments.map(e => e.studentId))];
    const studentsData = await db.student.findMany({
      where: {
        userId: {
          in: studentUserIds
        }
      },
      include: {
        user: true,
        department: true,
        course: true,
      }
    });

    // Format students list
    const students = allEnrollments.map((enrollment) => {
      const studentData = studentsData.find(s => s.userId === enrollment.studentId);
      if (!studentData) return null;

      return {
        id: enrollment.id,
        studentId: studentData.studentId,
        user: {
          name: studentData.user.name,
          email: studentData.user.email,
        },
        department: {
          name: studentData.department.name,
          code: studentData.department.code,
        },
        course: {
          name: studentData.course.name,
          code: studentData.course.code,
        },
        subject: {
          name: enrollment.subject.name,
          code: enrollment.subject.code,
        },
        year: studentData.year,
        semester: studentData.semester,
        enrolledAt: enrollment.enrolledAt,
      };
    }).filter(Boolean);

    // Format files list
    const files = allFiles.map((file) => ({
      id: file.id,
      title: file.title,
      description: file.description,
      uploadedAt: file.uploadedAt,
      fileUpload: {
        originalName: file.fileUpload.originalName,
        fileSize: file.fileUpload.fileSize,
        mimeType: file.fileUpload.mimeType,
        cloudinaryUrl: file.fileUpload.cloudinaryUrl,
      },
      subject: {
        id: file.subject.id,
        name: file.subject.name,
        code: file.subject.code,
      },
    }));

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        teacherId: teacher.teacherId,
        department: {
          name: teacher.department.name,
          code: teacher.department.code,
        },
      },
      stats: totalStats,
      recentClasses,
      subjects,
      students,
      files,
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
