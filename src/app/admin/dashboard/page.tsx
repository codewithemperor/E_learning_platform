"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Users, BookOpen, FileText, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
      title: "Total Students",
      value: "1,234",
      description: "Active students",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Teachers",
      value: "89",
      description: "Active teachers",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Courses",
      value: "45",
      description: "Available courses",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Total Files",
      value: "567",
      description: "Uploaded files",
      icon: FileText,
      color: "text-orange-600",
    },
  ];

  const recentActivities = [
    { id: 1, action: "New student registered", time: "2 minutes ago" },
    { id: 2, action: "Teacher uploaded new material", time: "15 minutes ago" },
    { id: 3, action: "New course created", time: "1 hour ago" },
    { id: 4, action: "Department updated", time: "2 hours ago" },
  ];

  return (
    <DashboardLayout userRole="admin" userName={user.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the admin dashboard. Manage your e-learning system from here.
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

        {/* Recent Activities and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-sm">{activity.action}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Shield className="h-6 w-6 text-purple-600 mb-2" />
                  <div className="font-medium">Add User</div>
                  <div className="text-sm text-gray-500">Create new user account</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="font-medium">Add Course</div>
                  <div className="text-sm text-gray-500">Create new course</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <div className="font-medium">Upload File</div>
                  <div className="text-sm text-gray-500">Add new learning material</div>
                </button>
                <button className="p-4 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Users className="h-6 w-6 text-orange-600 mb-2" />
                  <div className="font-medium">View Reports</div>
                  <div className="text-sm text-gray-500">System analytics</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}