"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Calendar, Clock, Search, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  course: {
    id: string;
    name: string;
    code: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    user: {
      name: string;
      email: string;
    };
    teacherId: string;
  } | null;
  enrolledAt: string;
}

export default function ClassesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useAlert();

  // Wait for user to load
  useEffect(() => {
    if (!authLoading) {
      setUserLoading(false);
      if (user) {
        fetchSubjects();
      } else {
        setLoading(false);
        showError("Please log in to view your classes");
      }
    }
  }, [user, authLoading]);

  const fetchSubjects = async () => {
    try {
      if (!user?.id) {
        showError("User information not available");
        setLoading(false);
        return;
      }

      // Use the user ID directly since enrollment table references User.id
      const response = await fetch(`/api/student/subjects?studentId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        if (data.length === 0) {
          showError("No enrolled subjects found. Please contact your administrator.");
        } else {
          showSuccess(`Loaded ${data.length} subject${data.length !== 1 ? 's' : ''} successfully`);
        }
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch subjects");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showError("An error occurred while fetching subjects");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.teacher?.user.name && subject.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show loading state while auth or subjects are loading
  if (userLoading || authLoading) {
    return (
      <DashboardLayout userRole="student" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading user information...</p>
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
              Please log in to view your enrolled classes.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || ""}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
            <p className="text-muted-foreground">
              View your enrolled subjects and class information
            </p>
          </div>
          <Button 
            onClick={fetchSubjects} 
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

        {/* Search and Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search classes by subject name, code, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled Subjects</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Classes List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Enrolled Subjects
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  {loading ? "Loading subjects..." : 
                   `${filteredSubjects.length} subject${filteredSubjects.length !== 1 ? "s" : ""} found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading your classes...</p>
                    </div>
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "No subjects match your search." 
                        : subjects.length === 0 
                          ? "No subjects enrolled yet. Contact your administrator to enroll in classes." 
                          : "No subjects found."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSubject?.id === subject.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedSubject(subject)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium">{subject.name}</h3>
                              <Badge variant="secondary">{subject.code}</Badge>
                              <Badge variant="outline">Semester {subject.semester}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {subject.course.name}
                              </div>
                              {subject.teacher && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {subject.teacher.user.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subject Details */}
          <div className="space-y-4">
            {selectedSubject ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Subject Details
                    </CardTitle>
                    <CardDescription>
                      {selectedSubject.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">Subject Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="font-medium">Code:</span> {selectedSubject.code}</p>
                          <p><span className="font-medium">Course:</span> {selectedSubject.course.name}</p>
                          <p><span className="font-medium">Department:</span> {selectedSubject.department.name}</p>
                          <p><span className="font-medium">Semester:</span> {selectedSubject.semester}</p>
                          <p><span className="font-medium">Enrolled:</span> {new Date(selectedSubject.enrolledAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {selectedSubject.teacher ? (
                        <div>
                          <h4 className="font-medium text-sm">Instructor</h4>
                          <div className="mt-2 space-y-1 text-sm">
                            <p><span className="font-medium">Name:</span> {selectedSubject.teacher.user.name}</p>
                            <p><span className="font-medium">Email:</span> {selectedSubject.teacher.user.email}</p>
                            <p><span className="font-medium">Teacher ID:</span> {selectedSubject.teacher.teacherId}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium text-sm">Instructor</h4>
                          <p className="text-sm text-muted-foreground mt-2">No instructor assigned</p>
                        </div>
                      )}

                     
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Assignments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium mb-2">Select a Subject</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a subject from the list to view details and access course materials.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}