"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";
import { ValidatedForm } from "@/components/validated-form";
import { fileUploadSchema, type FileUploadFormData } from "@/lib/validations";

interface FileUploadProps {
  subjectId?: string;
  uploadedBy: string;
  onUploadComplete?: () => void;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export function FileUpload({ subjectId, uploadedBy, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (data: FileUploadFormData) => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("subjectId", data.subjectId);
      formData.append("uploadedBy", uploadedBy);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      // Reset form
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      if (onUploadComplete) {
        onUploadComplete();
      }

      // Show success message (you can replace this with a toast notification)
      alert("File uploaded successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload File
        </CardTitle>
        <CardDescription>
          Upload learning materials for your students
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-4">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
            required
          />
        </div>

        {file && (
          <div className="p-3 border rounded-lg bg-gray-50 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <ValidatedForm
          schema={fileUploadSchema}
          onSubmit={handleUpload}
          defaultValues={{ 
            title: file?.name.replace(/\.[^/.]+$/, "") || "", 
            description: "", 
            subjectId: subjectId || "" 
          }}
        >
          {({ register, errors, isSubmitting }) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter file title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter file description"
                  {...register("description")}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={register("subjectId").value} 
                  onValueChange={(value) => {
                    register("subjectId").onChange({
                      target: { value, name: "subjectId" }
                    } as any);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs101">Computer Science 101</SelectItem>
                    <SelectItem value="cs201">Data Structures</SelectItem>
                    <SelectItem value="web101">Web Development</SelectItem>
                    <SelectItem value="db101">Database Systems</SelectItem>
                  </SelectContent>
                </Select>
                {errors.subjectId && (
                  <p className="text-sm text-red-600">{errors.subjectId}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !file}
              >
                {isSubmitting ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          )}
        </ValidatedForm>
      </CardContent>
    </Card>
  );
}