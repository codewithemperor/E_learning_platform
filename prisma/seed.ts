import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Create departments
  const csDept = await prisma.department.create({
    data: {
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science and Engineering'
    }
  });

  const mathDept = await prisma.department.create({
    data: {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Department of Mathematics'
    }
  });

  // Create courses
  const csCourse = await prisma.course.create({
    data: {
      name: 'Bachelor of Computer Science',
      code: 'BCS',
      departmentId: csDept.id,
      duration: 4,
      description: '4-year undergraduate program in Computer Science'
    }
  });

  const mathCourse = await prisma.course.create({
    data: {
      name: 'Bachelor of Mathematics',
      code: 'BMATH',
      departmentId: mathDept.id,
      duration: 3,
      description: '3-year undergraduate program in Mathematics'
    }
  });

  // Create subjects
  const cs101 = await prisma.subject.create({
    data: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      courseId: csCourse.id,
      semester: 1,
      description: 'Fundamental concepts of computer science'
    }
  });

  const cs201 = await prisma.subject.create({
    data: {
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      courseId: csCourse.id,
      semester: 2,
      description: 'Study of data structures and algorithmic techniques'
    }
  });

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      adminProfile: {
        create: {}
      }
    }
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: teacherPassword,
      name: 'John Smith',
      role: 'TEACHER',
      teacherProfile: {
        create: {
          teacherId: 'T001',
          departmentId: csDept.id
        }
      }
    }
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: studentPassword,
      name: 'Alice Johnson',
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S001',
          departmentId: csDept.id,
          courseId: csCourse.id,
          year: 1,
          semester: 1
        }
      }
    }
  });

  // Create teacher-subject assignments
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacher.id,
      subjectId: cs101.id,
      classCode: 'CS101-A'
    }
  });

  // Create student enrollments
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      subjectId: cs101.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@example.com / admin123');
  console.log('Teacher credentials: teacher@example.com / teacher123');
  console.log('Student credentials: student@example.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });