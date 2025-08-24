"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Users, BookOpen, FileText, Video } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  totalFiles: number;
  totalVideoCalls: number;
}

interface TeacherClass {
  id: string;
  name: string;
  studentCount: number;
  schedule: string;
  subject: string;
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalFiles: 0,
    totalVideoCalls: 0
  });
  const [recentClasses, setRecentClasses] = useState<TeacherClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/teacher/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get teacher ID from auth user
      const teacherId = user?.id;
      if (!teacherId) return;

      const [statsResponse, classesResponse] = await Promise.all([
        fetch(`/api/teacher/dashboard/stats?teacherId=${teacherId}`),
        fetch(`/api/teacher/dashboard/classes?teacherId=${teacherId}`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setRecentClasses(classesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
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

  const statsCards = [
    {
      title: "My Classes",
      value: stats.totalClasses.toString(),
      description: "Active classes",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      description: "Enrolled students",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Uploaded Files",
      value: stats.totalFiles.toString(),
      description: "Learning materials",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Video Calls",
      value: stats.totalVideoCalls.toString(),
      description: "This month",
      icon: Video,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout userRole="teacher" userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the teacher dashboard. Manage your classes and students from here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Classes and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Your current teaching schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{classItem.name}</div>
                      <div className="text-sm text-gray-500">{classItem.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{classItem.students} students</div>
                      <div className="text-xs text-gray-500">Enrolled</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common teacher tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <FileText className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="font-medium">Upload Material</div>
                  <div className="text-sm text-gray-500">Add new files</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Video className="h-6 w-6 text-green-600 mb-2" />
                  <div className="font-medium">Start Video Call</div>
                  <div className="text-sm text-gray-500">Live session</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Users className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="font-medium">View Students</div>
                  <div className="text-sm text-gray-500">Manage enrollments</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <BookOpen className="h-6 w-6 text-orange-600 mb-2" />
                  <div className="font-medium">Class Schedule</div>
                  <div className="text-sm text-gray-500">View timetable</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}