import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get recent activities
    const activities = await Promise.all([
      // Recent student enrollments
      db.enrollment.findMany({
        include: {
          student: {
            include: {
              user: true,
            },
          },
          teacherSubject: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: {
          enrolledAt: "desc",
        },
        take: 5,
      }),
      // Recent file uploads
      db.subjectFile.findMany({
        include: {
          fileUpload: true,
          teacherSubject: {
            include: {
              teacher: {
                include: {
                  user: true,
                },
              },
              subject: true,
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
        take: 5,
      }),
      // Recent teacher assignments
      db.teacherSubject.findMany({
        include: {
          teacher: {
            include: {
              user: true,
            },
          },
          subject: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    // Format and combine activities
    const formattedActivities = [
      ...activities[0].map((enrollment) => ({
        id: `enrollment-${enrollment.id}`,
        type: "enrollment",
        description: `${enrollment.student.user.name} enrolled in ${enrollment.teacherSubject.subject.name}`,
        timestamp: enrollment.enrolledAt,
        user: enrollment.student.user.name,
        icon: "user-plus",
        color: "green",
      })),
      ...activities[1].map((file) => ({
        id: `file-${file.id}`,
        type: "file_upload",
        description: `${file.teacherSubject.teacher.user.name} uploaded ${file.title}`,
        timestamp: file.uploadedAt,
        user: file.teacherSubject.teacher.user.name,
        icon: "upload",
        color: "blue",
      })),
      ...activities[2].map((assignment) => ({
        id: `assignment-${assignment.id}`,
        type: "teacher_assignment",
        description: `${assignment.teacher.user.name} assigned to ${assignment.subject.name}`,
        timestamp: assignment.createdAt,
        user: assignment.teacher.user.name,
        icon: "user-check",
        color: "purple",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Get top 10 recent activities

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("Error fetching admin dashboard activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard activities" },
      { status: 500 }
    );
  }
}