"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Users, BookOpen, FileText, Video } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";

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
  time: string;
  subject: string;
  students: number;
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalFiles: 0,
    totalVideoCalls: 0,
  });
  const [recentClasses, setRecentClasses] = useState<TeacherClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/teacher/login";
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      const teacherId = user?.teacherProfile?.userId;
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const response = await fetch(
        `/api/teacher/dashboard?teacherId=${teacherId}`
      );

      if (response.ok) {
        const data = await response.json();

        // 🟢 Map API stats to frontend shape
        setStats({
          totalClasses: data.stats?.totalSubjects || 0,
          totalStudents: data.stats?.totalStudents || 0,
          totalFiles: data.stats?.totalFiles || 0,
          totalVideoCalls: data.stats?.totalVideoCalls || 0, // may not exist yet
        });

        setRecentClasses(data.recentClasses || []);
        showSuccess("Dashboard data loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showError("Failed to fetch dashboard data");
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
    return null;
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
            Welcome to the teacher dashboard. Manage your classes and students
            from here.
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
                {recentClasses.length > 0 ? (
                  recentClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{classItem.name}</div>
                        <div className="text-sm text-gray-500">
                          {classItem.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {classItem.students} students
                        </div>
                        <div className="text-xs text-gray-500">Enrolled</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No classes found</p>
                )}
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
               
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
