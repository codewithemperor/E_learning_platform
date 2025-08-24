"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, Download, Calendar, Loader2, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";

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
  instructor?: string;
}

interface DashboardData {
  stats: StudentStats;
  courses: StudentCourse[];
  recentFiles: RecentFile[];
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      enrolledCourses: 0,
      availableFiles: 0,
      downloads: 0,
      weeklyClasses: 0
    },
    courses: [],
    recentFiles: []
  });
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // Wait for user to load
  useEffect(() => {
    if (!authLoading) {
      setUserLoading(false);
      if (user) {
        fetchDashboardData();
      } else {
        setLoading(false);
        showError("Please log in to view your dashboard");
      }
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      if (!user?.id) {
        showError("User information not available");
        setLoading(false);
        return;
      }

      // Use consolidated dashboard API
      const response = await fetch(`/api/student/dashboard?studentId=${user.id}`);
      
      if (response.ok) {
        const data: DashboardData = await response.json();
        setDashboardData(data);
        showSuccess("Dashboard loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch dashboard data");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError("An error occurred while loading your dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth or dashboard are loading
  if (userLoading || authLoading) {
    return (
      <DashboardLayout userRole="student" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show login required if no user
  if (!user) {
    return (
      <DashboardLayout userRole="student" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-medium mb-2">Login Required</h3>
            <p className="text-sm text-muted-foreground">
              Please log in to view your dashboard.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.href = '/student/login'}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statsCards = [
    {
      title: "Enrolled Courses",
      value: dashboardData.stats.enrolledCourses.toString(),
      description: "Active courses",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Available Files",
      value: dashboardData.stats.availableFiles.toString(),
      description: "Learning materials",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Downloads",
      value: dashboardData.stats.downloads.toString(),
      description: "Files downloaded",
      icon: Download,
      color: "text-purple-600",
    },
    {
      title: "This Week",
      value: dashboardData.stats.weeklyClasses.toString(),
      description: "Classes scheduled",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  return (
    <DashboardLayout userRole="student" userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to the student dashboard. Access your courses and learning materials from here.
            </p>
          </div>
          <Button 
            onClick={fetchDashboardData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : dashboardData.courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.courses.map((course) => (
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Latest learning materials</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : dashboardData.recentFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">No files available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{file.title}</div>
                        <div className="text-sm text-gray-500">
                          {file.course} • {file.instructor || "Unknown instructor"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => window.location.href = '/student/files'}
              >
                <FileText className="h-6 w-6 text-blue-600 mb-2" />
                <div className="font-medium">View Files</div>
                <div className="text-sm text-gray-500">Access materials</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => window.location.href = '/student/classes'}
              >
                <BookOpen className="h-6 w-6 text-green-600 mb-2" />
                <div className="font-medium">My Classes</div>
                <div className="text-sm text-gray-500">View schedule</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => window.location.href = '/student/files'}
              >
                <Download className="h-6 w-6 text-purple-600 mb-2" />
                <div className="font-medium">Downloads</div>
                <div className="text-sm text-gray-500">Downloaded files</div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => window.location.href = '/student/course-form'}
              >
                <Calendar className="h-6 w-6 text-orange-600 mb-2" />
                <div className="font-medium">Course Form</div>
                <div className="text-sm text-gray-500">Register courses</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}