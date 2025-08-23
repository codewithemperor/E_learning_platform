import { z } from "zod";

// Login form validation
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

// Department form validation
export const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Department code must be at least 2 characters")
    .max(10, "Department code must not exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Department code must contain only uppercase letters and numbers"),
  description: z.string().optional(),
});

// Course form validation
export const courseSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters"),
  code: z.string().min(3, "Course code must be at least 3 characters")
    .max(10, "Course code must not exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Course code must contain only uppercase letters and numbers"),
  departmentId: z.string().min(1, "Please select a department"),
  duration: z.number().min(1, "Duration must be at least 1 year")
    .max(10, "Duration must not exceed 10 years"),
  description: z.string().optional(),
});

// Subject form validation
export const subjectSchema = z.object({
  name: z.string().min(3, "Subject name must be at least 3 characters"),
  code: z.string().min(3, "Subject code must be at least 3 characters")
    .max(10, "Subject code must not exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Subject code must contain only uppercase letters and numbers"),
  courseId: z.string().min(1, "Please select a course"),
  semester: z.number().min(1, "Semester must be at least 1")
    .max(12, "Semester must not exceed 12"),
  description: z.string().optional(),
});

// User form validation
export const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

// Student profile validation
export const studentProfileSchema = z.object({
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  departmentId: z.string().min(1, "Please select a department"),
  courseId: z.string().min(1, "Please select a course"),
  year: z.number().min(1, "Year must be at least 1")
    .max(6, "Year must not exceed 6"),
  semester: z.number().min(1, "Semester must be at least 1")
    .max(12, "Semester must not exceed 12"),
});

// Teacher profile validation
export const teacherProfileSchema = z.object({
  teacherId: z.string().min(3, "Teacher ID must be at least 3 characters"),
  departmentId: z.string().min(1, "Please select a department"),
});

// File upload validation
export const fileUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Please select a subject"),
});

// Course form validation for students
export const courseFormSchema = z.object({
  departmentId: z.string().min(1, "Please select a department"),
  courseId: z.string().min(1, "Please select a course"),
  year: z.number().min(1, "Year must be at least 1")
    .max(6, "Year must not exceed 6"),
  semester: z.number().min(1, "Semester must be at least 1")
    .max(12, "Semester must not exceed 12"),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type CourseFormFormData = z.infer<typeof courseFormSchema>;