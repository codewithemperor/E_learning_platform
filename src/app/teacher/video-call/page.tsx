"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VideoCall } from "@/components/video-call";
import { useAuth } from "@/hooks/use-auth";

export default function TeacherVideoCallPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/teacher/login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout userRole="teacher" userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Video Call</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start a video call with your students for live lectures and discussions.
          </p>
        </div>

        <VideoCall 
          teacherId={user.id}
          subjectId="cs101" // This would come from the selected subject
          classCode="CS101-A" // This would come from the teacher-subject assignment
        />
      </div>
    </DashboardLayout>
  );
}