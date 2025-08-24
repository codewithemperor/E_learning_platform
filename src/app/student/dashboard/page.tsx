"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, Download, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface StudentStats {
  enrolledCourses: number;
  availableFiles: number;
  downloads: number;
  weeklyClasses: number;
}

interface StudentCourse {
  id: string;
  name: string;
  instructor: string;
  progress: number;
}

interface RecentFile {
  id: string;
  title: string;
  course: string;
  uploadedAt: string;
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    availableFiles: 0,
    downloads: 0,
    weeklyClasses: 0
  });
  const [myCourses, setMyCourses] = useState<StudentCourse[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/student/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, coursesResponse, filesResponse] = await Promise.all([
        fetch('/api/student/dashboard/stats'),
        fetch('/api/student/dashboard/courses'),
        fetch('/api/student/dashboard/files')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setMyCourses(coursesData);
      }

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setRecentFiles(filesData);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
      title: "Enrolled Courses",
      value: stats.enrolledCourses.toString(),
      description: "Active courses",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Available Files",
      value: stats.availableFiles.toString(),
      description: "Learning materials",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Downloads",
      value: stats.downloads.toString(),
      description: "Files downloaded",
      icon: Download,
      color: "text-purple-600",
    },
    {
      title: "This Week",
      value: stats.weeklyClasses.toString(),
      description: "Classes scheduled",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout userRole="student" userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the student dashboard. Access your courses and learning materials from here.
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

        {/* My Courses and Recent Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your enrolled courses and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div key={course.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-500">Instructor: {course.instructor}</div>
                      </div>
                      <div className="text-sm font-medium text-blue-600">{course.progress}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Latest learning materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{file.title}</div>
                      <div className="text-sm text-gray-500">{file.course}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()}</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common student tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-6 w-6 text-blue-600 mb-2" />
                <div className="font-medium">View Files</div>
                <div className="text-sm text-gray-500">Access materials</div>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <BookOpen className="h-6 w-6 text-green-600 mb-2" />
                <div className="font-medium">My Classes</div>
                <div className="text-sm text-gray-500">View schedule</div>
              </button>
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <Download className="h-6 w-6 text-purple-600 mb-2" />
                <div className="font-medium">Downloads</div>
                <div className="text-sm text-gray-500">Downloaded files</div>
              </button>
              <button 
                className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => window.location.href = '/student/course-form'}
              >
                <Calendar className="h-6 w-6 text-orange-600 mb-2" />
                <div className="font-medium">Course Form</div>
                <div className="text-sm text-gray-500">Register courses</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}