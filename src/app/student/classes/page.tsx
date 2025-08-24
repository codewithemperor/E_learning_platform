"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Calendar, Clock, Search, User } from "lucide-react";
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
  teacher: {
    user: {
      name: string;
      email: string;
    };
    teacherId: string;
  };
}

export default function ClassesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/student/subjects");
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

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || ""}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            View your enrolled subjects and class information
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search classes by subject name, code, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled Subjects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Subjects</CardTitle>
              <CardDescription>
                {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No subjects match your search." : "No subjects enrolled yet."}
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
                            <h3 className="font-medium">{subject.name}</h3>
                            <Badge variant="secondary">{subject.code}</Badge>
                            <Badge variant="outline">Semester {subject.semester}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {subject.course.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {subject.teacher.user.name}
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
                    {selectedSubject.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Subject Information</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Code:</span> {selectedSubject.code}</p>
                        <p><span className="font-medium">Course:</span> {selectedSubject.course.name}</p>
                        <p><span className="font-medium">Department:</span> {selectedSubject.department.name}</p>
                        <p><span className="font-medium">Semester:</span> {selectedSubject.semester}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">Instructor</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedSubject.teacher.user.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedSubject.teacher.user.email}</p>
                        <p><span className="font-medium">Teacher ID:</span> {selectedSubject.teacher.teacherId}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm">Quick Actions</h4>
                      <div className="mt-2 space-y-2">
                        <Button size="sm" className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Course Materials
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Class Schedule
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          View Attendance
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">Attendance Rate</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">Assignments</p>
                    </div>
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
                  Choose a subject from the list to view details and access course materials.
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