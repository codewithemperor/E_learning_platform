"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, User, Bell, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface StudentProfile {
  id: string;
  studentId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  department: {
    name: string;
    code: string;
  };
  course: {
    name: string;
    code: string;
  };
  year: number;
  semester: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.user.name,
        email: profile.user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      if (!user?.studentProfile?.id) {
        console.error("No student ID available");
        return;
      }
      
      const response = await fetch(`/api/student/profile?studentId=${user.studentProfile.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user?.studentProfile?.id) {
        showError("Error", "Student ID not available");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/student/profile?studentId=${user.studentProfile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        showSuccess("Profile Updated", "Your profile has been updated successfully");
        fetchProfile(); // Refresh profile data
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to update profile");
      }
    } catch (error) {
      showError("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.newPassword !== formData.confirmPassword) {
      showError("Error", "New passwords do not match");
      setSaving(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      showError("Error", "Password must be at least 6 characters long");
      setSaving(false);
      return;
    }

    try {
      if (!user?.studentProfile?.id) {
        showError("Error", "Student ID not available");
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/student/password?studentId=${user.studentProfile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        showSuccess("Password Updated", "Your password has been changed successfully");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to update password");
      }
    } catch (error) {
      showError("Error", "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || ""}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {profile && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <p className="text-sm text-muted-foreground">{profile.studentId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile.department.name} ({profile.department.code})
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile.course.name} ({profile.course.code})
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <p className="text-sm text-muted-foreground">
                        Year {profile.year}, Semester {profile.semester}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Assignment Deadlines</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming assignment deadlines
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Course Materials</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when new materials are uploaded
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Class Announcements</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about class announcements and updates
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Grade Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when grades are updated
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about system maintenance and updates
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}