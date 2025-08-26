"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Mail, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Subject {
  id: string;
  name: string;
  code: string;
  classCode: string;
  course: string;
  department: string;
  semester: number;
  enrollmentCount: number;
}

interface Student {
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  department: {
    name: string;
    code: string;
  };
  course: {
    name: string;
    code: string;
  };
  subject: {
    name: string;
    code: string;
  };
  year: number;
  semester: number;
  enrolledAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== "all" && user) {
      fetchStudents(selectedSubject);
    } else if (user) {
      fetchStudents();
    }
  }, [selectedSubject, user]);

  const fetchSubjects = async () => {
    if (!user) return;
    try {
      const teacherId = user?.teacherProfile?.userId;
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const response = await fetch(`/api/teacher/subjects?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        showSuccess("Subjects loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showError("Failed to fetch subjects");
    }
  };

  const fetchStudents = async (subjectId?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const teacherId = user?.teacherProfile?.userId;
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const url = subjectId
        ? `/api/teacher/students?teacherId=${teacherId}&subjectId=${subjectId}`
        : `/api/teacher/students?teacherId=${teacherId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        showSuccess("Students loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      showError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || ""}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
            <p className="text-muted-foreground">
              View and manage students enrolled in your classes
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.classCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredStudents.length}</div>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Students List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm || (selectedSubject && selectedSubject !== "all")
                      ? "No students match your search criteria."
                      : "No students enrolled yet."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.enrollmentId}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedStudent?.enrollmentId === student.enrollmentId
                            ? "border-primary bg-primary/5"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{student.name}</h3>
                              <Badge variant="secondary">{student.studentId}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {student.course.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline">Year {student.year}</Badge>
                              <Badge variant="outline">Semester {student.semester}</Badge>
                              <Badge variant="outline">
                                {new Date(student.enrolledAt).toLocaleDateString()}
                              </Badge>
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

          {/* Student Details */}
          <div className="space-y-4">
            {selectedStudent ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Student Details
                    </CardTitle>
                    <CardDescription>{selectedStudent.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">Personal Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedStudent.name}</p>
                          <p><span className="font-medium">Student ID:</span> {selectedStudent.studentId}</p>
                          <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Academic Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="font-medium">Department:</span> {selectedStudent.department.name}</p>
                          <p><span className="font-medium">Course:</span> {selectedStudent.course.name}</p>
                          <p><span className="font-medium">Subject:</span> {selectedStudent.subject.name}</p>
                          <p><span className="font-medium">Year:</span> {selectedStudent.year}</p>
                          <p><span className="font-medium">Semester:</span> {selectedStudent.semester}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Enrollment Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="font-medium">Enrolled Date:</span> {new Date(selectedStudent.enrolledAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Quick Actions</h4>
                        <div className="mt-2 space-y-2">
                          <Button size="sm" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Academic Progress
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Attendance
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
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
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium mb-2">Select a Student</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a student from the list to view their details and academic information.
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