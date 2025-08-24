"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, User } from "lucide-react";
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
  departmentId: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  course: {
    name: string;
    code: string;
  };
}

interface Teacher {
  id: string;
  teacherId: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  department: Department;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  teacherId: string;
  departmentId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  teacherId?: string;
  departmentId?: string;
}

export default function TeachersPage() {
  const { user, loading } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const { showSuccess, showError, showConfirm } = useAlert();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    teacherId: "",
    departmentId: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchTeachers();
      fetchDepartments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchCourses(selectedDepartment);
      fetchSubjects(selectedDepartment);
    } else {
      setCourses([]);
      setSubjects([]);
      setSelectedSubjects([]);
    }
  }, [selectedDepartment]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingTeacher) {
        const autoTeacherId = `T${String(teachers.length + 1).padStart(3, '0')}`;
        setFormData({
          name: editingTeacher.user.name,
          email: editingTeacher.user.email,
          password: "",
          teacherId: editingTeacher.teacherId,
          departmentId: editingTeacher.department.id,
        });
        setSelectedDepartment(editingTeacher.department.id);
      } else {
        const autoTeacherId = `T${String(teachers.length + 1).padStart(3, '0')}`;
        setFormData({
          name: "",
          email: "",
          password: "",
          teacherId: autoTeacherId,
          departmentId: "",
        });
        setSelectedDepartment("");
        setSelectedSubjects([]);
      }
      setFormErrors({});
    }
  }, [isDialogOpen, editingTeacher, teachers.length]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCourses = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/courses?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSubjects = async (departmentId: string) => {
    try {
      const response = await fetch(`/api/subjects?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!editingTeacher && !formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.teacherId.trim()) {
      errors.teacherId = "Teacher ID is required";
    }

    if (!formData.departmentId) {
      errors.departmentId = "Department is required";
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

    try {
      setIsSubmitting(true);

      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || undefined,
        role: "TEACHER",
        profile: {
          teacherId: formData.teacherId.trim(),
          departmentId: formData.departmentId
        },
        subjects: selectedSubjects
      };

      const url = editingTeacher 
        ? `/api/teachers/${editingTeacher.id}`
        : "/api/teachers";
      
      const method = editingTeacher ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        showSuccess(
          editingTeacher ? "Teacher Updated" : "Teacher Created",
          `Teacher ${editingTeacher ? "updated" : "created"} successfully`
        );
        fetchTeachers();
        setEditingTeacher(null);
        setIsDialogOpen(false);
        setSelectedDepartment("");
        setSelectedSubjects([]);
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to save teacher");
      }
    } catch (error) {
      showError("Error", "Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setSelectedDepartment(teacher.department.id);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTeacher(null);
    setSelectedDepartment("");
    setSelectedSubjects([]);
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingTeacher(null);
    setIsDialogOpen(false);
    setSelectedDepartment("");
    setSelectedSubjects([]);
  };

  const handleDelete = async (teacher: Teacher) => {
    const confirmed = await showConfirm(
      "Delete Teacher",
      `Are you sure you want to delete "${teacher.user.name}"?`,
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/teachers/${teacher.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "Teacher deleted successfully");
          fetchTeachers();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete teacher");
        }
      } catch (error) {
        showError("Error", "Failed to delete teacher");
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
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">
              Manage teaching staff
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                </DialogTitle>
                <DialogDescription>
                  {editingTeacher 
                    ? "Update teacher information"
                    : "Create a new teacher account"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="e.g., john.doe@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={editingTeacher ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherId">Teacher ID</Label>
                  <Input
                    id="teacherId"
                    value={formData.teacherId}
                    onChange={(e) => handleInputChange("teacherId", e.target.value)}
                    placeholder="e.g., T001"
                    readOnly={!editingTeacher}
                    className={!editingTeacher ? "bg-gray-100" : ""}
                  />
                  {!editingTeacher && (
                    <p className="text-sm text-gray-600">Teacher ID is auto-generated</p>
                  )}
                  {formErrors.teacherId && (
                    <p className="text-sm text-red-600">{formErrors.teacherId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => {
                      handleInputChange("departmentId", value);
                      setSelectedDepartment(value);
                      setSelectedSubjects([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No departments available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.departmentId && (
                    <p className="text-sm text-red-600">{formErrors.departmentId}</p>
                  )}
                </div>

                {selectedDepartment && subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Assign Subjects</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject.id}
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubjects([...selectedSubjects, subject.id]);
                              } else {
                                setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                              }
                            }}
                          />
                          <Label htmlFor={subject.id} className="text-sm cursor-pointer">
                            {subject.name} ({subject.code}) - {subject.course.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedSubjects.length > 0 && (
                      <p className="text-sm text-gray-600">
                        {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting 
                      ? (editingTeacher ? "Updating..." : "Creating...")
                      : (editingTeacher ? "Update Teacher" : "Create Teacher")
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

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Teachers</CardTitle>
            <CardDescription>
              {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No teachers found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.user.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{teacher.teacherId}</Badge>
                      </TableCell>
                      <TableCell>{teacher.user.email}</TableCell>
                      <TableCell>{teacher.department.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(teacher)}
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