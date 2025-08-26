"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { Search, Download, FileText, Image, Video, Music, File, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Subject {
  id: string;
  name: string;
  code: string;
  classCode: string;
}

interface FileItem {
  id: string;
  title: string;
  description?: string;
  uploadedAt: string;
  fileUpload: {
    id: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    cloudinaryUrl: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
    classCode: string;
  };
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string>("");
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    fetchSubjects();
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedSubject !== "all") {
      fetchFiles(selectedSubject);
    } else {
      fetchFiles();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      // Get teacher ID from auth user - should use teacherProfile.id
      const teacherId = user?.teacherProfile?.userId;
      if (!teacherId) {
        showError('Teacher profile not found');
        return;
      }
      
      const response = await fetch(`/api/teacher/subjects?teacherId=${teacherId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
        showSuccess('Subjects loaded successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (subjectId?: string) => {
    try {
      setLoading(true);
      
      // Get teacher ID from auth user - should use teacherProfile.id
      const teacherId = user?.teacherProfile?.userId;
      if (!teacherId) {
        showError('Teacher profile not found');
        return;
      }
      
      const url = subjectId 
        ? `/api/teacher/files?teacherId=${teacherId}&subjectId=${subjectId}`
        : `/api/teacher/files?teacherId=${teacherId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        showSuccess('Files loaded successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to fetch files');
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      showError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    const confirmed = await showConfirm(
      "Delete File",
      "Are you sure you want to delete this file? This action cannot be undone.",
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "File deleted successfully");
          fetchFiles(selectedSubject);
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete file");
        }
      } catch (error) {
        showError("Error", "Failed to delete file");
      }
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    setUploadSubjectId("");
    fetchFiles(selectedSubject);
    showSuccess("Upload Complete", "File uploaded successfully");
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-4 w-4" alt="Image file" />;
    } else if (mimeType.startsWith("video/")) {
      return <Video className="h-4 w-4" alt="Video file" />;
    } else if (mimeType.startsWith("audio/")) {
      return <Music className="h-4 w-4" alt="Audio file" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = files.filter((file) =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.fileUpload.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
          <p className="text-muted-foreground">
            Upload and manage learning materials for your subjects
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New File</CardTitle>
            <CardDescription>
              Upload learning materials for your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Subject</label>
                <Select value={uploadSubjectId} onValueChange={setUploadSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.classCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {uploadSubjectId && (
                <FileUpload
                  subjectId={uploadSubjectId}
                  uploadedBy={user?.id || ""}
                  onUploadComplete={handleUploadComplete}
                />
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUpload(false);
                    setUploadSubjectId("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files by title or filename..."
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
            <div className="text-2xl font-bold">{filteredFiles.length}</div>
            <p className="text-xs text-muted-foreground">Files</p>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>My Files</CardTitle>
          <CardDescription>
            {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm || (selectedSubject && selectedSubject !== "all") 
                ? "No files match your search criteria." 
                : "No files uploaded yet."
              }
            </p>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-blue-600">
                      {getFileIcon(file.fileUpload.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{file.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.fileUpload.fileSize)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {file.fileUpload.originalName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{file.subject.name} ({file.subject.classCode})</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {file.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.fileUpload.cloudinaryUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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