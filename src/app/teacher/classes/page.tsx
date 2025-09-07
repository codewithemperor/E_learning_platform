"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Calendar, Clock, Search } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  description?: string | null;
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    studentId: string;
    name: string;
    email: string;
    year: number;
    semester: number;
    department: { name: string; code: string };
    course: { name: string; code: string };
  };
  enrolledAt: string;
}

interface TeacherClass {
  id: string;
  classCode: string;
  subject: Subject;
  course: {
    name: string;
    code: string;
  };
  department: {
    name: string;
    code: string;
  };
  enrollments: Enrollment[];
  studentCount: number;
  createdAt?: string;
}

export default function ClassesPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/teacher/login";
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      setLoadingData(true);

      const teacherId = user?.teacherProfile?.userId;
      console.log("Teacher ID:", teacherId);
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const response = await fetch(`/api/teacher/classes?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched classes:", data);
        setClasses(data);
        showSuccess("Classes loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      showError("Failed to fetch classes");
    } finally {
      setLoadingData(false);
    }
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout userRole="teacher" userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
            <p className="text-muted-foreground">
              Manage your teaching assignments and student enrollments
            </p>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search classes by subject name, code, or class code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Total Classes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Classes List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Assignments</CardTitle>
                <CardDescription>
                  {filteredClasses.length} class
                  {filteredClasses.length !== 1 ? "es" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredClasses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm
                      ? "No classes match your search."
                      : "No classes assigned yet."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedClass?.id === classItem.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedClass(classItem)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {classItem.subject.name}
                              </h3>
                              <Badge variant="secondary">
                                {classItem.subject.code}
                              </Badge>
                              <Badge variant="outline">{classItem.classCode}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {classItem.course?.name || "No course"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Semester {classItem.subject.semester}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {classItem.enrollments.length} student
                                {classItem.enrollments.length !== 1 ? "s" : ""}
                              </div>
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

          {/* Class Details */}
          <div className="space-y-4">
            {selectedClass ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Class Details
                    </CardTitle>
                    <CardDescription>
                      {selectedClass.subject.name} ({selectedClass.classCode})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">Subject Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Code:</span>{" "}
                            {selectedClass.subject.code}
                          </p>
                          <p>
                            <span className="font-medium">Course:</span>{" "}
                            {selectedClass.course?.name}
                          </p>
                          <p>
                            <span className="font-medium">Department:</span>{" "}
                            {selectedClass.department?.name}
                          </p>
                          <p>
                            <span className="font-medium">Semester:</span>{" "}
                            {selectedClass.subject.semester}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Enrollment Statistics</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Total Students:</span>{" "}
                            {selectedClass.enrollments.length}
                          </p>
                        </div>
                      </div>

                   
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedClass.enrollments.slice(0, 5).map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{enrollment.student.name}</p>
                            <p className="text-muted-foreground">
                              {enrollment.student.studentId}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                      {selectedClass.enrollments.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          +{selectedClass.enrollments.length - 5} more students
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium mb-2">Select a Class</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a class from the list to view details and manage students.
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
