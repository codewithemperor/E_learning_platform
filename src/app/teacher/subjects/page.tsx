"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, FileText, Upload, Search } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  course: {
    name: string;
    code: string;
  };
  department: {
    name: string;
    code: string;
  };
}

interface TeacherSubject {
  id: string;
  classCode: string;
  subject: Subject;
  enrollments: Enrollment[];
  files: SubjectFile[];
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
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const teacherId = user?.id;
      if (!teacherId) return;
      
      const response = await fetch(`/api/teacher/subjects?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    if (selectedSubject) {
      // Refresh the selected subject to show new files
      const updatedSubjects = subjects.map(subject => {
        if (subject.id === selectedSubject.id) {
          return { ...subject, files: [...subject.files] }; // This will be updated when we fetch fresh data
        }
        return subject;
      });
      setSubjects(updatedSubjects);
    }
    showSuccess("Upload Complete", "File uploaded successfully");
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subjects List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Assignments</CardTitle>
              <CardDescription>
                {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No subjects match your search." : "No subjects assigned yet."}
                </p>
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{subject.subject.name}</h3>
                            <Badge variant="secondary">{subject.subject.code}</Badge>
                            <Badge variant="outline">{subject.classCode}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {subject.subject.course.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {subject.enrollments.length} student{subject.enrollments.length !== 1 ? "s" : ""}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {subject.files.length} file{subject.files.length !== 1 ? "s" : ""}
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
                    {selectedSubject.subject.name} ({selectedSubject.classCode})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Subject Information</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Code:</span> {selectedSubject.subject.code}</p>
                        <p><span className="font-medium">Course:</span> {selectedSubject.subject.course.name}</p>
                        <p><span className="font-medium">Department:</span> {selectedSubject.subject.department.name}</p>
                        <p><span className="font-medium">Semester:</span> {selectedSubject.subject.semester}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">Statistics</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Enrolled Students:</span> {selectedSubject.enrollments.length}</p>
                        <p><span className="font-medium">Uploaded Files:</span> {selectedSubject.files.length}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">Quick Actions</h4>
                      <div className="mt-2 space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowUpload(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          View Students
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          View All Files
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Form */}
              {showUpload && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>
                      Upload learning materials for this subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      subjectId={selectedSubject.id}
                      uploadedBy={user?.id || ""}
                      onUploadComplete={handleUploadComplete}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Recent Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedSubject.files.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No files uploaded yet
                      </p>
                    ) : (
                      selectedSubject.files.slice(0, 5).map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 text-sm border rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {file.fileUpload.originalName}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(file.fileUpload.cloudinaryUrl, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      ))
                    )}
                    {selectedSubject.files.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground pt-2">
                        +{selectedSubject.files.length - 5} more files
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
                <h3 className="font-medium mb-2">Select a Subject</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a subject from the list to view details and manage files.
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