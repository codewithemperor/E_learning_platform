"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash2, Eye } from "lucide-react";

interface FileItem {
  id: string;
  title: string;
  description?: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  subject?: {
    name: string;
    code: string;
  };
}

interface FileListProps {
  subjectId?: string;
  uploadedBy?: string;
  refreshTrigger?: number;
}

export function FileList({ subjectId, uploadedBy, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [subjectId, uploadedBy, refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError("");

      let url = "/api/files";
      const params = new URLSearchParams();
      
      if (subjectId) params.append("subjectId", subjectId);
      if (uploadedBy) params.append("uploadedBy", uploadedBy);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error: any) {
      setError(error.message || "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (file: FileItem) => {
    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = file.cloudinaryUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Remove file from list
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (error: any) {
      setError(error.message || "Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word")) return "📝";
    if (mimeType.includes("powerpoint")) return "📊";
    if (mimeType.includes("excel")) return "📈";
    return "📄";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{file.title}</h3>
                  {file.description && (
                    <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {file.originalName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)}
                    </span>
                    {file.subject && (
                      <Badge variant="secondary" className="text-xs">
                        {file.subject.code}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.cloudinaryUrl, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}