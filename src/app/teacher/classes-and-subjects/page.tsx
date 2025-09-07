"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Calendar, Clock, Search, FileText, Upload, Eye, Download } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
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

export default function ClassesAndSubjectsPage() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [selectedClassForFiles, setSelectedClassForFiles] = useState<TeacherClass | null>(null);
  const [subjectFiles, setSubjectFiles] = useState<SubjectFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
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
      if (!teacherId) {
        showError("Teacher profile not found");
        return;
      }

      const response = await fetch(`/api/teacher/classes?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
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

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchClasses();
    showSuccess("Upload Complete", "File uploaded successfully");
  };

  const fetchClassFiles = async (classItem: TeacherClass) => {
    try {
      setLoadingFiles(true);
      setSelectedClassForFiles(classItem);
      
      const response = await fetch(`/api/teacher/files?teacherId=${user?.teacherProfile?.userId}&subjectId=${classItem.subject.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubjectFiles(data);
        setShowFiles(true);
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      showError("Failed to fetch files");
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchSubjectFiles = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/teacher/files?teacherId=${user?.teacherProfile?.userId}&subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjectFiles(data);
      } else {
        showError("Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      showError("Failed to fetch files");
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
    <DashboardLayout userRole="teacher" userName={user.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Classes & Subjects</h1>
            <p className="text-muted-foreground">
              Manage your teaching assignments, student enrollments, and learning materials
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

        {/* Classes List */}
        <Card>
          <CardHeader>
            <CardTitle>Class Assignments</CardTitle>
            <CardDescription>
              {filteredClasses.length} class{filteredClasses.length !== 1 ? "es" : ""} found
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
                    className="p-4 border rounded-lg hover:bg-gray-50"
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
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedClass(classItem)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Class Details</DialogTitle>
                              <DialogDescription>
                                {classItem.subject.name} ({classItem.classCode})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm">Subject Information</h4>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">Code:</span>{" "}
                                      {classItem.subject.code}
                                    </p>
                                    <p>
                                      <span className="font-medium">Course:</span>{" "}
                                      {classItem.course?.name}
                                    </p>
                                    <p>
                                      <span className="font-medium">Department:</span>{" "}
                                      {classItem.department?.name}
                                    </p>
                                    <p>
                                      <span className="font-medium">Semester:</span>{" "}
                                      {classItem.subject.semester}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">Statistics</h4>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">Total Students:</span>{" "}
                                      {classItem.enrollments.length}
                                    </p>
                                    <p>
                                      <span className="font-medium">Class Code:</span>{" "}
                                      {classItem.classCode}
                                    </p>
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    <h4 className="font-medium text-sm">Actions</h4>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => fetchClassFiles(classItem)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Files
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {classItem.subject.description && (
                                <div>
                                  <h4 className="font-medium text-sm">Description</h4>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {classItem.subject.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedClass(classItem)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Students
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Enrolled Students</DialogTitle>
                              <DialogDescription>
                                {classItem.subject.name} ({classItem.classCode}) - {classItem.enrollments.length} students
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {classItem.enrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                      <TableCell className="font-medium">
                                        {enrollment.student.studentId}
                                      </TableCell>
                                      <TableCell>{enrollment.student.name}</TableCell>
                                      <TableCell>{enrollment.student.email}</TableCell>
                                      <TableCell>{enrollment.student.department.name}</TableCell>
                                      <TableCell>{enrollment.student.course.name}</TableCell>
                                      <TableCell>Year {enrollment.student.year}</TableCell>
                                      <TableCell>
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                      </TableCell>
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
                                setSelectedClass(classItem);
                                setShowUpload(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Add File
                            </Button>
                          </DialogTrigger>
                            <DialogContent className="max-w-lg h-[75vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Upload File</DialogTitle>
                              <DialogDescription>
                                Upload learning materials for {classItem.subject.name}
                              </DialogDescription>
                            </DialogHeader>
                            <FileUpload
                              subjectId={classItem.subject.id}
                              subjectName={classItem.subject.name}
                              uploadedBy={user?.id || ""}
                              onUploadComplete={handleUploadComplete}
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedClass(classItem);
                                fetchSubjectFiles(classItem.subject.id);
                                setShowFiles(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Files
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Subject Files</DialogTitle>
                              <DialogDescription>
                                {classItem.subject.name} ({classItem.classCode}) - {subjectFiles.length} files
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              {subjectFiles.length === 0 ? (
                                <div className="text-center py-8">
                                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                  <p className="text-muted-foreground">No files uploaded yet</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {subjectFiles.map((file) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="text-blue-600">
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium">{file.title}</div>
                                          <p className="text-sm text-muted-foreground truncate">
                                            {file.fileUpload.originalName}
                                          </p>
                                          <div className="text-xs text-muted-foreground">
                                            {new Date(file.uploadedAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(file.fileUpload.cloudinaryUrl, "_blank")}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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