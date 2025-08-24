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

    // Get all dashboard data in parallel
    const [
      enrollments,
      availableFiles,
      recentFiles
    ] = await Promise.all([
      // Get enrolled subjects with teacher info
      db.enrollment.findMany({
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
      }),
      
      // Get count of available files
      db.subjectFile.count({
        where: {
          subject: {
            enrollments: {
              some: {
                studentId: actualUserId,
              },
            },
          },
        },
      }),
      
      // Get recent files
      db.subjectFile.findMany({
        where: {
          subject: {
            enrollments: {
              some: {
                studentId: actualUserId,
              },
            },
          },
        },
        include: {
          fileUpload: true,
          subject: {
            include: {
              teachers: {
                include: {
                  teacher: {
                    select: {
                      name: true,
                    }
                  }
                }
              }
            }
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
        take: 10,
      })
    ]);

    // Format courses data
    const courses = enrollments.map((enrollment) => {
      const teacherSubject = enrollment.subject.teachers[0];
      return {
        id: enrollment.subject.id,
        name: enrollment.subject.name,
        instructor: teacherSubject ? teacherSubject.teacher.name : "No instructor assigned",
        progress: Math.floor(Math.random() * 100), // Mock progress data
      };
    });

    // Format recent files data
    const files = recentFiles.map((file) => {
      const teacherSubject = file.subject.teachers[0];
      return {
        id: file.id,
        title: file.title,
        course: file.subject.name,
        uploadedAt: file.uploadedAt,
        instructor: teacherSubject ? teacherSubject.teacher.name : "Unknown",
      };
    });

    // Calculate stats
    const stats = {
      enrolledCourses: enrollments.length,
      availableFiles: availableFiles,
      downloads: 0, // Mock data - would need a downloads table
      weeklyClasses: Math.floor(Math.random() * 20), // Mock data - would need a schedule table
    };

    // Return consolidated dashboard data
    const dashboardData = {
      stats,
      courses,
      recentFiles: files,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}