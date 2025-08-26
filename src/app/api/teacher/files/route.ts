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

    let files;
    
    if (subjectId) {
      // Get files for a specific subject that this teacher teaches
      files = await db.subjectFile.findMany({
        where: {
          subjectId: subjectId,
          subject: {
            teachers: {
              some: {
                teacherId: teacherId
              }
            }
          }
        },
        include: {
          fileUpload: true,
          subject: true,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    } else {
      // Get all files for this teacher across all their subjects
      files = await db.subjectFile.findMany({
        where: {
          subject: {
            teachers: {
              some: {
                teacherId: teacherId
              }
            }
          }
        },
        include: {
          fileUpload: true,
          subject: true,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      });
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching teacher files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}