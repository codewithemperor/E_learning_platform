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
  department: {
    name: string;
    code: string;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  description?: string;
  courseId: string;
  course: Course;
  createdAt: string;
}

interface FormData {
  name: string;
  code: string;
  courseId: string;
  semester: string;
  description: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  courseId?: string;
  semester?: string;
  description?: string;
}

export default function SubjectsPage() {
  const { user, loading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, showConfirm } = useAlert();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    courseId: "",
    semester: "",
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
      fetchSubjects();
      fetchDepartments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchCourses(selectedDepartment);
    } else {
      setCourses([]);
    }
  }, [selectedDepartment]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingSubject) {
        setFormData({
          name: editingSubject.name,
          code: editingSubject.code,
          courseId: editingSubject.courseId,
          semester: editingSubject.semester.toString(),
          description: editingSubject.description || "",
        });
        // Set department for editing
        const subjectDepartment = departments.find(dept => 
          dept.name === editingSubject.course.department.name
        );
        if (subjectDepartment) {
          setSelectedDepartment(subjectDepartment.id);
        }
      } else {
        setFormData({
          name: "",
          code: "",
          courseId: "",
          semester: "",
          description: "",
        });
        setSelectedDepartment("");
      }
      setFormErrors({});
    }
  }, [isDialogOpen, editingSubject, departments]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
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

  const fetchCourses = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/courses?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Subject name is required";
    }

    if (!formData.code.trim()) {
      errors.code = "Subject code is required";
    }

    if (!formData.courseId) {
      errors.courseId = "Course is required";
    }

    if (!formData.semester.trim()) {
      errors.semester = "Semester is required";
    } else {
      const semester = parseInt(formData.semester);
      if (isNaN(semester) || semester < 1 || semester > 12) {
        errors.semester = "Semester must be between 1 and 12";
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
      courseId: formData.courseId,
      semester: parseInt(formData.semester),
      description: formData.description.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      const url = editingSubject 
        ? `/api/subjects/${editingSubject.id}`
        : "/api/subjects";
      
      const method = editingSubject ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showSuccess(
          editingSubject ? "Subject Updated" : "Subject Created",
          `Subject ${editingSubject ? "updated" : "created"} successfully`
        );
        fetchSubjects();
        setEditingSubject(null);
        setSelectedDepartment("");
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to save subject");
      }
    } catch (error) {
      showError("Error", "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSubject(null);
    setSelectedDepartment("");
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setSelectedDepartment("");
    setIsDialogOpen(false);
  };

  const handleDelete = async (subject: Subject) => {
    const confirmed = await showConfirm(
      "Delete Subject",
      `Are you sure you want to delete "${subject.name}"?`,
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/subjects/${subject.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "Subject deleted successfully");
          fetchSubjects();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete subject");
        }
      } catch (error) {
        showError("Error", "Failed to delete subject");
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
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">
              Manage academic subjects
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription>
                  {editingSubject 
                    ? "Update subject information"
                    : "Create a new academic subject"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Data Structures"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="e.g., CS201"
                  />
                  {formErrors.code && (
                    <p className="text-sm text-red-600">{formErrors.code}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={selectedDepartment} 
                    onValueChange={setSelectedDepartment}
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
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {departments.length === 0 ? "No departments available" : "Loading departments..."}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseId">Course</Label>
                  <Select 
                    value={formData.courseId} 
                    onValueChange={(value) => handleInputChange("courseId", value)}
                    disabled={!selectedDepartment || courses.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedDepartment 
                          ? "Select a department first" 
                          : courses.length === 0 
                            ? "No courses available"
                            : "Select a course"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(courses) && courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {!selectedDepartment 
                            ? "Select a department first"
                            : "No courses available"
                          }
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.courseId && (
                    <p className="text-sm text-red-600">{formErrors.courseId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.semester}
                    onChange={(e) => handleInputChange("semester", e.target.value)}
                    placeholder="e.g., 1"
                  />
                  {formErrors.semester && (
                    <p className="text-sm text-red-600">{formErrors.semester}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Subject description..."
                    rows={3}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedDepartment || courses.length === 0}
                    className="flex-1"
                  >
                    {isSubmitting 
                      ? (editingSubject ? "Updating..." : "Creating...")
                      : (editingSubject ? "Update Subject" : "Create Subject")
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

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subjects</CardTitle>
            <CardDescription>
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No subjects found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>{subject.course.name}</TableCell>
                      <TableCell>{subject.course.department.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Semester {subject.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(subject)}
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