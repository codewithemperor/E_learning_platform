"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Shield,
  User,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "admin" | "teacher" | "student";
  userName: string;
}

const menuItems = {
  admin: [
    { title: "Dashboard", icon: Home, url: "/admin/dashboard" },
    { title: "Departments", icon: BookOpen, url: "/admin/departments" },
    { title: "Courses", icon: FileText, url: "/admin/courses" },
    { title: "Subjects", icon: BookOpen, url: "/admin/subjects" },
    { title: "Teachers", icon: User, url: "/admin/teachers" },
    { title: "Students", icon: GraduationCap, url: "/admin/students" },
    { title: "File Management", icon: FileText, url: "/admin/files" },
    { title: "Settings", icon: Settings, url: "/admin/settings" },
  ],
  teacher: [
    { title: "Dashboard", icon: Home, url: "/teacher/dashboard" },
    { title: "My Classes", icon: BookOpen, url: "/teacher/classes" },
    { title: "Subjects", icon: FileText, url: "/teacher/subjects" },
    { title: "Students", icon: GraduationCap, url: "/teacher/students" },
    { title: "File Management", icon: FileText, url: "/teacher/files" },
    { title: "Video Call", icon: User, url: "/teacher/video-call" },
    { title: "Settings", icon: Settings, url: "/teacher/settings" },
  ],
  student: [
    { title: "Dashboard", icon: Home, url: "/student/dashboard" },
    { title: "My Classes", icon: BookOpen, url: "/student/classes" },
    { title: "Subject Files", icon: FileText, url: "/student/files" },
    { title: "Video Call", icon: User, url: "/student/video-call" },
    { title: "Course Form", icon: FileText, url: "/student/course-form" },
    { title: "Settings", icon: Settings, url: "/student/settings" },
  ]
};

const roleColors = {
  admin: "bg-[var(--admin-primary)] hover:bg-[var(--admin-secondary)] text-white",
  teacher: "bg-[var(--teacher-primary)] hover:bg-[var(--teacher-secondary)] text-white", 
  student: "bg-[var(--student-primary)] hover:bg-[var(--student-secondary)] text-white"
};

const roleHeadingColors = {
  admin: "heading-admin",
  teacher: "heading-teacher",
  student: "heading-student"
};

const roleIcons = {
  admin: Shield,
  teacher: User,
  student: GraduationCap
};

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const RoleIcon = roleIcons[userRole];
  const items = menuItems[userRole];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:block border-r">
          <SidebarContent className="bg-[var(--sidebar)]">
            <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
              <div className={`p-2 rounded-lg ${roleColors[userRole]}`}>
                <RoleIcon className="h-5 w-5 text-white" />
              </div>
              <span className={`font-semibold capitalize text-sidebar-foreground ${roleHeadingColors[userRole]}`}>
                {userRole} Portal
              </span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Header */}
          <header className="border-b bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 bg-[var(--sidebar)]">
                    <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
                      <div className={`p-2 rounded-lg ${roleColors[userRole]}`}>
                        <RoleIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className={`font-semibold capitalize text-sidebar-foreground ${roleHeadingColors[userRole]}`}>
                        {userRole} Portal
                      </span>
                    </div>
                    <nav className="mt-4">
                      {items.map((item) => (
                        <a
                          key={item.title}
                          href={item.url}
                          className="flex items-center gap-2 p-2 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] rounded text-sidebar-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                <h1 className={`text-xl font-semibold capitalize ${roleHeadingColors[userRole]}`}>
                  {userRole} Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[userRole]}`}>
                  {userRole}
                </div>
                <span className="text-sm text-muted-foreground">
                  Welcome, {userName}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}