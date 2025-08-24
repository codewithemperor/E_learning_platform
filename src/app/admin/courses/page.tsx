"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
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
  description?: string;
  duration: number;
  departmentId: string;
  department: Department;
  createdAt: string;
}

interface FormData {
  name: string;
  code: string;
  departmentId: string;
  duration: string;
  description: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  departmentId?: string;
  duration?: string;
  description?: string;
}

export default function CoursesPage() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, showConfirm } = useAlert();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    departmentId: "",
    duration: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchDepartments();
    }
  }, [user]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingCourse) {
        setFormData({
          name: editingCourse.name,
          code: editingCourse.code,
          departmentId: editingCourse.departmentId,
          duration: editingCourse.duration.toString(),
          description: editingCourse.description || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          departmentId: "",
          duration: "",
          description: "",
        });
      }
      setFormErrors({});
    }
  }, [isDialogOpen, editingCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Course name is required";
    }

    if (!formData.code.trim()) {
      errors.code = "Course code is required";
    }

    if (!formData.departmentId) {
      errors.departmentId = "Department is required";
    }

    if (!formData.duration.trim()) {
      errors.duration = "Duration is required";
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration < 1 || duration > 10) {
        errors.duration = "Duration must be between 1 and 10 years";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      departmentId: formData.departmentId,
      duration: parseInt(formData.duration),
      description: formData.description.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      const url = editingCourse 
        ? `/api/courses/${editingCourse.id}`
        : "/api/courses";
      
      const method = editingCourse ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showSuccess(
          editingCourse ? "Course Updated" : "Course Created",
          `Course ${editingCourse ? "updated" : "created"} successfully`
        );
        fetchCourses();
        setEditingCourse(null);
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to save course");
      }
    } catch (error) {
      showError("Error", "Failed to save course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = async (course: Course) => {
    const confirmed = await showConfirm(
      "Delete Course",
      `Are you sure you want to delete "${course.name}"?`,
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/courses/${course.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "Course deleted successfully");
          fetchCourses();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete course");
        }
      } catch (error) {
        showError("Error", "Failed to delete course");
      }
    }
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setIsDialogOpen(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              Manage academic courses
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </DialogTitle>
                <DialogDescription>
                  {editingCourse 
                    ? "Update course information"
                    : "Create a new academic course"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="e.g., BCS"
                  />
                  {formErrors.code && (
                    <p className="text-sm text-red-600">{formErrors.code}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => handleInputChange("departmentId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departments) && departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {departments.length === 0 ? "No departments available" : "Loading departments..."}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.departmentId && (
                    <p className="text-sm text-red-600">{formErrors.departmentId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="e.g., 4"
                  />
                  {formErrors.duration && (
                    <p className="text-sm text-red-600">{formErrors.duration}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Course description..."
                    rows={3}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || departments.length === 0}
                    className="flex-1"
                  >
                    {isSubmitting 
                      ? (editingCourse ? "Updating..." : "Creating...")
                      : (editingCourse ? "Update Course" : "Create Course")
                    }
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>
              {courses.length} course{courses.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No courses found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.code}</Badge>
                      </TableCell>
                      <TableCell>{course.department.name}</TableCell>
                      <TableCell>{course.duration} year{course.duration !== 1 ? "s" : ""}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {course.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(course)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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