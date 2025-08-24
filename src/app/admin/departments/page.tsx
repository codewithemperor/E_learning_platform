"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Building } from "lucide-react";
import { ValidatedForm } from "@/components/validated-form";
import { departmentSchema, type DepartmentFormData } from "@/lib/validations";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
}

export default function DepartmentsPage() {
  const { user, loading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      const url = editingDepartment 
        ? `/api/departments/${editingDepartment.id}`
        : "/api/departments";
      
      const method = editingDepartment ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccess(
          editingDepartment ? "Department Updated" : "Department Created",
          `Department ${editingDepartment ? "updated" : "created"} successfully`
        );
        fetchDepartments();
        setEditingDepartment(null);
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to save department");
      }
    } catch (error) {
      showError("Error", "Failed to save department");
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
    const confirmed = await showConfirm(
      "Delete Department",
      `Are you sure you want to delete "${department.name}"?`,
      "Yes, delete it",
      "Cancel"
    );

    if (confirmed) {
      try {
        const response = await fetch(`/api/departments/${department.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showSuccess("Deleted", "Department deleted successfully");
          fetchDepartments();
        } else {
          const error = await response.json();
          showError("Error", error.error || "Failed to delete department");
        }
      } catch (error) {
        showError("Error", "Failed to delete department");
      }
    }
  };

  const handleAddNew = () => {
    setEditingDepartment(null);
    setIsDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingDepartment(null);
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
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Manage academic departments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {editingDepartment ? "Edit Department" : "Add New Department"}
                </DialogTitle>
                <DialogDescription>
                  {editingDepartment 
                    ? "Update department information"
                    : "Create a new academic department"
                  }
                </DialogDescription>
              </DialogHeader>
              <ValidatedForm
                schema={departmentSchema}
                onSubmit={handleSubmit}
                defaultValues={editingDepartment ? {
                  name: editingDepartment.name,
                  code: editingDepartment.code,
                  description: editingDepartment.description || "",
                } : undefined}
              >
                {({ register, errors, isSubmitting }) => (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Computer Science"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">Department Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g., CS"
                        {...register("code")}
                      />
                      {errors.code && (
                        <p className="text-sm text-red-600">{errors.code}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Department description..."
                        {...register("description")}
                        rows={3}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting 
                          ? (editingDepartment ? "Updating..." : "Creating...")
                          : (editingDepartment ? "Update Department" : "Create Department")
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
                  </div>
                )}
              </ValidatedForm>
            </DialogContent>
          </Dialog>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>
              {departments.length} department{departments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No departments found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{department.code}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {department.description || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(department.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(department)}
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