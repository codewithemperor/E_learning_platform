"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, FileText, Upload, Search, Eye } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  classCode: string;
  course: string;
  department: string;
  semester: number;
  enrollmentCount: number;
  enrollments?: Enrollment[];
  files?: SubjectFile[];
}

interface Enrollment {
  id: string;
  student: {
    user: {
      name: string;
      email: string;
    };
    studentId: string;
  };
}

interface SubjectFile {
  id: string;
  title: string;
  description?: string;
  uploadedAt: string;
  fileUpload: {
    originalName: string;
    fileSize: number;
    mimeType: string;
    cloudinaryUrl: string;
  };
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/teacher/login";
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const teacherId = user?.teacherProfile?.userId;
      console.log("Teacher ID:", teacherId);
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const response = await fetch(`/api/teacher/subjects?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSubjects(data);
        showSuccess("Subjects loaded successfully");
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    if (selectedSubject) {
      const updatedSubjects = subjects.map((subject) => {
        if (subject.id === selectedSubject.id) {
          return { ...subject, files: [...(subject.files || [])] };
        }
        return subject;
      });
      setSubjects(updatedSubjects);
    }
    showSuccess("Upload Complete", "File uploaded successfully");
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.classCode.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
            <p className="text-muted-foreground">
              Manage your subjects, upload materials, and track student progress
            </p>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subjects by name, code, or class code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">Total Subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Assignments</CardTitle>
            <CardDescription>
              {filteredSubjects.length} subject
              {filteredSubjects.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm
                  ? "No subjects match your search."
                  : "No subjects assigned yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{subject.name}</h3>
                          <Badge variant="secondary">{subject.code}</Badge>
                          <Badge variant="outline">{subject.classCode}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {subject.course}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {subject.enrollmentCount} student
                            {subject.enrollmentCount !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {(subject.files?.length || 0)} file
                            {(subject.files?.length || 0) !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedSubject(subject)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Subject Details</DialogTitle>
                              <DialogDescription>
                                {subject.name} ({subject.classCode})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm">Subject Information</h4>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">Code:</span>{" "}
                                      {subject.code}
                                    </p>
                                    <p>
                                      <span className="font-medium">Course:</span>{" "}
                                      {subject.course}
                                    </p>
                                    <p>
                                      <span className="font-medium">Department:</span>{" "}
                                      {subject.department}
                                    </p>
                                    <p>
                                      <span className="font-medium">Semester:</span>{" "}
                                      {subject.semester}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">Statistics</h4>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">Enrolled Students:</span>{" "}
                                      {subject.enrollmentCount}
                                    </p>
                                    <p>
                                      <span className="font-medium">Uploaded Files:</span>{" "}
                                      {subject.files?.length || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedSubject(subject)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Students
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Enrolled Students</DialogTitle>
                              <DialogDescription>
                                {subject.name} ({subject.classCode}) - {subject.enrollmentCount} students
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {subject.enrollments?.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                      <TableCell className="font-medium">
                                        {enrollment.student.studentId}
                                      </TableCell>
                                      <TableCell>{enrollment.student.user.name}</TableCell>
                                      <TableCell>{enrollment.student.user.email}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSubject(subject);
                                setShowUpload(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload File
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Upload File</DialogTitle>
                              <DialogDescription>
                                Upload learning materials for {subject.name}
                              </DialogDescription>
                            </DialogHeader>
                            <FileUpload
                              subjectId={subject.id}
                              subjectName={subject.name}
                              uploadedBy={user?.id || ""}
                              onUploadComplete={handleUploadComplete}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
