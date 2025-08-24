"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, User, Mail, Building, GraduationCap } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  department: Department;
}

interface Student {
  id: string;
  studentId: string;
  year: number;
  semester: number;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  department: Department;
  course: Course;
  createdAt: string;
}

export default function StudentsPage() {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (student: Student) => {
    const confirmed = await showConfirm(
      "Delete Student",
      `Are you sure you want to delete "${student.user.name}"?`,
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/students/${student.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "Student deleted successfully");
          fetchStudents();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete student");
        }
      } catch (error) {
        showError("Error", "Failed to delete student");
      }
    }
  };

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
    <DashboardLayout userRole="admin" userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              View enrolled students (Students register themselves)
            </p>
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              {students.length} student{students.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No students found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.user.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.studentId}</Badge>
                      </TableCell>
                      <TableCell>{student.user.email}</TableCell>
                      <TableCell>{student.department.name}</TableCell>
                      <TableCell>{student.course.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Year {student.year}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Semester {student.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(student)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}