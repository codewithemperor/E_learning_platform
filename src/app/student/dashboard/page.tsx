"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BookOpen, FileText, Download, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function StudentDashboard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/student/login';
    }
  }, [user, loading]);

  if (loading) {
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

  const stats = [
    {
      title: "Enrolled Courses",
      value: "5",
      description: "Active courses",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Available Files",
      value: "45",
      description: "Learning materials",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Downloads",
      value: "23",
      description: "Files downloaded",
      icon: Download,
      color: "text-purple-600",
    },
    {
      title: "This Week",
      value: "8",
      description: "Classes scheduled",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  const myCourses = [
    { id: 1, name: "Computer Science 101", instructor: "Dr. Smith", progress: 75 },
    { id: 2, name: "Data Structures", instructor: "Prof. Johnson", progress: 60 },
    { id: 3, name: "Web Development", instructor: "Dr. Brown", progress: 90 },
    { id: 4, name: "Database Systems", instructor: "Prof. Davis", progress: 45 },
  ];

  const recentFiles = [
    { id: 1, title: "Lecture 1: Introduction", course: "Computer Science 101", uploaded: "2 days ago" },
    { id: 2, title: "Assignment 2: Algorithms", course: "Data Structures", uploaded: "3 days ago" },
    { id: 3, title: "Lab Manual: HTML/CSS", course: "Web Development", uploaded: "1 week ago" },
    { id: 4, title: "Chapter 3: SQL Basics", course: "Database Systems", uploaded: "1 week ago" },
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
          {stats.map((stat) => (
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
                      <div className="text-xs text-gray-500">{file.uploaded}</div>
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
              <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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