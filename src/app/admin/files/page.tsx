"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileList } from "@/components/file-list";
import { Search, Download, FileText, Image, Video, Music, File } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  uploader: {
    name: string;
    email: string;
  };
  subjectFiles: Array<{
    subject: {
      name: string;
      code: string;
    };
  }>;
}

export default function FilesPage() {
  const { user, loading } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoadingData(false);
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
          fetchFiles();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete file");
        }
      } catch (error) {
        showError("Error", "Failed to delete file");
      }
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
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.subjectFiles.some(sf => 
      sf.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
    <DashboardLayout userRole="admin" userName={user.name}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
          <p className="text-muted-foreground">
            Manage all uploaded files in the system
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files by name, uploader, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>All Files</CardTitle>
          <CardDescription>
            {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? "No files match your search." : "No files found."}
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
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{file.originalName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.fileSize)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Uploaded by {file.uploader.name}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {file.subjectFiles.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          {file.subjectFiles.map((sf, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {sf.subject.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.cloudinaryUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
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