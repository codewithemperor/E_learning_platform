"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Building, GraduationCap, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  duration: number;
  department: Department;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  courseName: string;
  departmentName: string;
  enrollmentCount: number;
}

interface Enrollment {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  courseName: string;
  departmentName: string;
  enrolledAt: string;
}

interface StudentProfile {
  id: string;
  studentId: string;
  year: number;
  semester: number;
  department: Department;
  course: Course;
}

export default function CourseFormPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchDepartments();
    fetchStudentProfile();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchCourses(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (studentProfile) {
      setSelectedDepartment(studentProfile.department.id);
      setSelectedCourse(studentProfile.course.id);
      fetchEnrollments();
      fetchAllSubjectsForCourse(studentProfile.course.id);
    }
  }, [studentProfile]);

  useEffect(() => {
    if (enrollments.length > 0 && availableSubjects.length > 0) {
      const enrolledSubjectIds = enrollments.map(e => e.subjectId);
      setSelectedSubjects(enrolledSubjectIds);
    }
  }, [enrollments, availableSubjects]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCourses = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/courses?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch("/api/student/profile");
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSubjects = async (courseId: string, year: number, semester: number) => {
    try {
      const response = await fetch(`/api/student/available-subjects?courseId=${courseId}&year=${year}&semester=${semester}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching available subjects:", error);
    }
  };

  const fetchAllSubjectsForCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/student/all-subjects?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching all subjects for course:", error);
    }
  };

  const fetchEnrollments = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/student/enrollments?studentId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const handleSubjectSelection = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      showError("Error", "User not authenticated");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/student/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user.id,
          subjectIds: selectedSubjects,
        }),
      });

      if (response.ok) {
        showSuccess("Registration Submitted", "Your course registration has been submitted successfully");
        setEditMode(false);
        fetchEnrollments();
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to submit registration");
      }
    } catch (error) {
      showError("Error", "Failed to submit registration");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const groupSubjectsBySemester = (subjects: Subject[]) => {
    const grouped = subjects.reduce((acc, subject) => {
      if (!acc[subject.semester]) {
        acc[subject.semester] = [];
      }
      acc[subject.semester].push(subject);
      return acc;
    }, {} as Record<number, Subject[]>);

    return Object.entries(grouped).sort(([a], [b]) => parseInt(a) - parseInt(b));
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
            <h1 className="text-3xl font-bold tracking-tight">Course Registration</h1>
            <p className="text-muted-foreground">
              Register for courses and update your academic information
            </p>
          </div>
        </div>

        {/* Current Registration Status */}
        {studentProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Current Registration
              </CardTitle>
              <CardDescription>
                You are currently registered for the following course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Student ID</p>
                    <p className="text-sm text-muted-foreground">{studentProfile.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{studentProfile.department.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Course</p>
                    <p className="text-sm text-muted-foreground">{studentProfile.course.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">Year & Semester</p>
                    <p className="text-sm text-muted-foreground">
                      Year {studentProfile.year}, Semester {studentProfile.semester}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Information */}
        {studentProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
              <CardDescription>
                Your current course and available subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {studentProfile.department.name} ({studentProfile.department.code})
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {studentProfile.course.name} ({studentProfile.course.code})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      Year {studentProfile.year}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {studentProfile.semester}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Subjects */}
        {selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Subjects
              </CardTitle>
              <CardDescription>
                All subjects for your course organized by semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No subjects available for this course</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupSubjectsBySemester(availableSubjects).map(([semester, subjects]) => (
                    <div key={semester}>
                      <h3 className="text-lg font-semibold mb-4">Semester {semester}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subject) => (
                          <div key={subject.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={subject.id}
                                checked={selectedSubjects.includes(subject.id)}
                                onCheckedChange={(checked) => handleSubjectSelection(subject.id, checked as boolean)}
                                disabled={!editMode && enrollments.length > 0}
                              />
                              <div className="flex-1 min-w-0">
                                <label htmlFor={subject.id} className="text-sm font-medium cursor-pointer">
                                  {subject.name}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                  {subject.code} • {subject.enrollmentCount} enrolled
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {selectedSubjects.length} subject(s) selected
                    </div>
                    <div className="flex space-x-2">
                      {enrollments.length > 0 && !editMode && (
                        <Button variant="outline" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Registration
                        </Button>
                      )}
                      <Button
                        onClick={handleSubmit}
                        disabled={selectedSubjects.length === 0 || submitting || (!editMode && enrollments.length > 0)}
                      >
                        {submitting ? "Submitting..." : (editMode || enrollments.length === 0 ? "Submit Registration" : "Registration Submitted")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Enrollments */}
        {enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Current Enrollments
              </CardTitle>
              <CardDescription>
                Subjects you are currently enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupSubjectsBySemester(enrollments.map(e => ({
                  id: e.subjectId,
                  name: e.subjectName,
                  code: e.subjectCode,
                  semester: e.semester,
                  courseName: e.courseName,
                  departmentName: e.departmentName,
                  enrollmentCount: 0
                } as Subject))).map(([semester, subjects]) => (
                  <div key={semester}>
                    <h3 className="text-lg font-semibold mb-3">Semester {semester}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{subject.name}</h4>
                              <p className="text-sm text-gray-500">{subject.code}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Enrolled
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Important Information</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Subjects are automatically loaded based on your current course</li>
                <li>• You can select multiple subjects using checkboxes</li>
                <li>• Subjects are organized by semester for easy selection</li>
                <li>• Once submitted, you can edit your registration by clicking "Edit Registration"</li>
                <li>• Contact administration if you need help with registration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}