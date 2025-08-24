"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileText, Image, Video, Music, File, BookOpen, Loader2, User } from "lucide-react";
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
  teacher: {
    user: {
      name: string;
    };
  };
}

export default function StudentFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useAlert();

  // Wait for user to load
  useEffect(() => {
    if (!authLoading) {
      setUserLoading(false);
      if (user) {
        fetchSubjects();
        fetchFiles();
      } else {
        setLoading(false);
        showError("Please log in to view your files");
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !userLoading) {
      if (selectedSubject && selectedSubject !== "all") {
        fetchFiles(selectedSubject);
      } else {
        fetchFiles();
      }
    }
  }, [selectedSubject, user, userLoading]);

  const fetchSubjects = async () => {
    try {
      if (!user?.id) {
        showError("User information not available");
        return;
      }

      const response = await fetch(`/api/student/subjects?studentId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.map((subject: any) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          classCode: `${subject.code}-${subject.semester}`,
        })));
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch subjects");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showError("An error occurred while fetching subjects");
    }
  };

  const fetchFiles = async (subjectId?: string) => {
    try {
      if (!user?.id) {
        showError("User information not available");
        setLoading(false);
        return;
      }

      const url = subjectId 
        ? `/api/student/files?studentId=${user.id}&subjectId=${subjectId}`
        : `/api/student/files?studentId=${user.id}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
        if (data.length === 0) {
          showError("No files found for your enrolled subjects");
        } else {
          showSuccess(`Loaded ${data.length} file${data.length !== 1 ? 's' : ''} successfully`);
        }
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to fetch files");
        console.error("API Error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      showError("An error occurred while fetching files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      if (!file.fileUpload.cloudinaryUrl || file.fileUpload.cloudinaryUrl === "#") {
        showError("File URL not available");
        return;
      }

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = file.fileUpload.cloudinaryUrl;
      link.download = file.fileUpload.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess(`Download started: ${file.title}`);
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download file");
    }
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

  // Show loading state while auth or files are loading
  if (userLoading || authLoading) {
    return (
      <DashboardLayout userRole="student" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading your files...</p>
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
              Please log in to view your files.
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
            <h1 className="text-3xl font-bold tracking-tight">Subject Files</h1>
            <p className="text-muted-foreground">
              Access learning materials and resources from your enrolled subjects
            </p>
          </div>
        </div>

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
              <p className="text-xs text-muted-foreground">Files Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Files</CardTitle>
            <CardDescription>
              {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm || (selectedSubject && selectedSubject !== "all") 
                  ? "No files match your search criteria." 
                  : "No files available yet."
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
                          <span>Uploaded by {file.teacher.user.name}</span>
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
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
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