# E-Learning Management System

A comprehensive three-portal E-Learning Management System built with Next.js 15, featuring distinct interfaces for administrators, teachers, and students with role-based access control, file management, and video call capabilities.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Software Development Methodology](#software-development-methodology)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [File Upload Process](#file-upload-process)
- [Testing Credentials](#testing-credentials)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

This E-Learning Management System provides a complete solution for online education with three distinct portals:

1. **Admin Portal**: System administration, user management, and overall system oversight
2. **Teacher Portal**: Course management, student tracking, file uploads, and video calls
3. **Student Portal**: Course enrollment, progress tracking, file access, and video participation

The system features role-based authentication, responsive design, Cloudinary integration for file management, and video call functionality for live learning sessions.

## Features

### Core Features
- **Role-Based Authentication**: Secure login system with three distinct user roles and custom session management
- **Responsive Design**: Mobile-first approach with adaptive layouts for all devices
- **File Management**: Cloudinary-powered file upload, storage, and retrieval
- **Video Calls**: Real-time video communication between teachers and students
- **Course Management**: Complete course, subject, and enrollment tracking
- **Form Validation**: Comprehensive validation using Zod schemas
- **Dashboard Analytics**: Role-specific statistics and activity tracking
- **SweetAlert Integration**: Beautiful, customizable alerts and notifications for better user experience

### Portal-Specific Features

#### Admin Portal
- System statistics and overview
- User management (create, edit, delete users)
- Department and course management
- Activity monitoring and logging
- Quick actions for common tasks

#### Teacher Portal
- Teaching statistics and class overview
- Course material management
- Student enrollment tracking
- File upload for course materials
- Video call creation and management

#### Student Portal
- Course progress tracking
- Class enrollment and registration
- File access and download capabilities
- Video call participation
- Personal dashboard with progress indicators

## Software Development Methodology

This project was developed using an **Agile methodology** with the following practices:

1. **Iterative Development**: Built in small, manageable increments with regular feedback
2. **User-Centric Design**: Focused on creating intuitive interfaces for each user role
3. **Test-Driven Approach**: Implemented comprehensive validation and error handling
4. **Continuous Integration**: Regular code quality checks with ESLint
5. **Responsive-First**: Mobile-first design with progressive enhancement
6. **Component-Based Architecture**: Reusable components for consistent UI/UX

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: Zustand for client state, TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Custom session-based authentication

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **File Storage**: Cloudinary
- **Video Calls**: WebRTC-based implementation
- **Password Hashing**: bcryptjs
- **Session Management**: Cookie-based sessions

### Development Tools
- **Code Quality**: ESLint with Next.js rules
- **Database Management**: Prisma Studio
- **Package Manager**: npm

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Video Call (Optional - for production WebRTC implementation)
WEBRTC_STUN_SERVER="stun:stun.l.google.com:19302"
WEBRTC_TURN_SERVER="your-turn-server"
WEBRTC_TURN_USERNAME="your-turn-username"
WEBRTC_TURN_CREDENTIAL="your-turn-credential"
```

## Database Schema

The system uses Prisma ORM with SQLite. The main entities include:

```prisma
// This is the actual schema from prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  studentProfile  Student?
  teacherProfile  Teacher?
  adminProfile    Admin?
  fileUploads     FileUpload[]
  enrollments     Enrollment[]
  teacherSubjects TeacherSubject[]

  @@map("users")
}

model Student {
  id          String @id @default(cuid())
  userId      String @unique
  studentId   String @unique
  departmentId String
  courseId    String
  year        Int
  semester    Int

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  department Department @relation(fields: [departmentId], references: [id])
  course     Course     @relation(fields: [courseId], references: [id])

  @@map("students")
}

model Teacher {
  id        String @id @default(cuid())
  userId    String @unique
  teacherId String @unique
  departmentId String

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  department Department @relation(fields: [departmentId], references: [id])

  @@map("teachers")
}

model Admin {
  id     String @id @default(cuid())
  userId String @unique

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("admins")
}

model Department {
  id          String @id @default(cuid())
  name        String @unique
  code        String @unique
  description String?

  students  Student[]
  teachers  Teacher[]
  courses   Course[]

  @@map("departments")
}

model Course {
  id           String @id @default(cuid())
  name         String
  code         String @unique
  departmentId String
  description  String?
  duration     Int // in years

  department Department @relation(fields: [departmentId], references: [id])
  subjects  Subject[]
  students  Student[]

  @@map("courses")
}

model Subject {
  id        String @id @default(cuid())
  name      String
  code      String @unique
  courseId  String
  semester  Int
  description String?

  course   Course             @relation(fields: [courseId], references: [id])
  teachers TeacherSubject[]
  files    SubjectFile[]
  enrollments Enrollment[]

  @@map("subjects")
}

model TeacherSubject {
  id        String @id @default(cuid())
  teacherId String
  subjectId String
  classCode String @unique

  teacher User    @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([teacherId, subjectId])
  @@map("teacher_subjects")
}

model Enrollment {
  id         String @id @default(cuid())
  studentId  String
  subjectId  String
  enrolledAt DateTime @default(now())

  student User    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([studentId, subjectId])
  @@map("enrollments")
}

model FileUpload {
  id          String @id @default(cuid())
  filename    String
  originalName String
  fileSize    Int
  mimeType    String
  cloudinaryUrl String?
  cloudinaryPublicId String?
  uploadedBy  String
  uploadedAt  DateTime @default(now())

  user User @relation(fields: [uploadedBy], references: [id], onDelete: Cascade)
  files SubjectFile[]

  @@map("file_uploads")
}

model SubjectFile {
  id          String @id @default(cuid())
  subjectId   String
  fileUploadId String
  title       String
  description String?
  uploadedAt  DateTime @default(now())

  subject   Subject     @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  fileUpload FileUpload @relation(fields: [fileUploadId], references: [id], onDelete: Cascade)

  @@map("subject_files")
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/e-learning-system.git
   cd e-learning-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your environment variables as described above

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Use the testing credentials below to log in

## File Upload Process

The file upload system uses a form-based approach that only uploads files when the form is successfully submitted, preventing unnecessary file creation. Here's how it works:

### Frontend Implementation

The file upload component uses the `ValidatedForm` component with Zod validation:

```tsx
// src/components/file-upload.tsx
export function FileUpload({ subjectId, uploadedBy, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

      // Reset form on success
      setFile(null);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      setError(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
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
          {/* File input and form fields */}
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
            required
          />
          {/* Other form fields */}
        </div>
      )}
    </ValidatedForm>
  );
}
```

### Backend Implementation

The file upload API endpoint handles the entire process in a single transaction with proper error handling:

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { unlinkSync, existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const subjectId = formData.get('subjectId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileName = `${uuidv4()}-${file.name}`;
    const tempFilePath = path.join(process.cwd(), 'temp', fileName);

    // Write file to temporary location
    await writeFile(tempFilePath, buffer);

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: 'auto',
        folder: 'e-learning',
        use_filename: true,
        unique_filename: true,
      });

      // Save file info to database
      const fileUpload = await db.fileUpload.create({
        data: {
          filename: result.public_id,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          uploadedBy,
        },
      });

      // Create subject file entry
      if (subjectId) {
        await db.subjectFile.create({
          data: {
            subjectId,
            fileUploadId: fileUpload.id,
            title: title || file.name,
            description: description || '',
          },
        });
      }

      // Clean up temporary file
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }

      return NextResponse.json({
        message: 'File uploaded successfully',
        file: {
          id: fileUpload.id,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
          fileSize: fileUpload.fileSize,
          mimeType: fileUpload.mimeType,
          cloudinaryUrl: fileUpload.cloudinaryUrl,
          title: title || file.name,
        },
      });
    } catch (cloudinaryError) {
      // Clean up temporary file even if Cloudinary upload fails
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
      throw cloudinaryError;
    }
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

### Key Benefits of This Approach

1. **Atomic Operations**: Files are only uploaded when the entire form submission is valid
2. **No Orphaned Files**: Temporary files are cleaned up even if Cloudinary upload fails
3. **Error Handling**: Comprehensive error handling with proper cleanup
4. **Security**: File validation and proper error responses
5. **Validation**: Zod schema validation for all form fields
6. **Transaction Integrity**: Database records are only created after successful Cloudinary upload

## Testing Credentials

Use the following credentials to test the system:

### Admin Portal
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Teacher Portal
- **Email**: teacher@example.com
- **Password**: teacher123
- **Access**: [http://localhost:3000/teacher](http://localhost:3000/teacher)

### Student Portal
- **Email**: student@example.com
- **Password**: student123
- **Access**: [http://localhost:3000/student](http://localhost:3000/student)

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin portal pages
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── departments/
│   │   ├── courses/
│   │   ├── subjects/
│   │   ├── teachers/
│   │   ├── students/
│   │   ├── files/
│   │   └── settings/
│   ├── teacher/        # Teacher portal pages
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── classes/
│   │   ├── subjects/
│   │   ├── students/
│   │   ├── files/
│   │   ├── video-call/
│   │   └── settings/
│   ├── student/        # Student portal pages
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── classes/
│   │   ├── files/
│   │   ├── course-form/
│   │   ├── video-call/
│   │   └── settings/
│   ├── api/           # API endpoints
│   │   ├── auth/      # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── me/
│   │   ├── upload/    # File upload endpoint
│   │   ├── files/     # File management endpoints
│   │   └── health/    # Health check endpoint
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── dashboard-layout.tsx  # Responsive layout component
│   ├── file-upload.tsx      # File upload component
│   ├── file-list.tsx        # File list component
│   ├── video-call.tsx       # Teacher video call component
│   ├── student-video-call.tsx # Student video call component
│   └── validated-form.tsx   # Form with validation component
├── hooks/
│   ├── use-auth.ts    # Authentication hook
│   ├── use-alert.ts   # SweetAlert notification hook
│   ├── use-mobile.ts  # Mobile detection hook
│   └── use-toast.ts   # Toast notification hook
└── lib/
    ├── db.ts          # Database connection
    ├── cloudinary.ts  # Cloudinary configuration
    ├── validations.ts # Zod validation schemas
    ├── socket.ts      # Socket.io configuration
    └── utils.ts       # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and structure
2. Ensure all new features include proper TypeScript types
3. Add validation for all user inputs
4. Test thoroughly across all user roles
5. Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.