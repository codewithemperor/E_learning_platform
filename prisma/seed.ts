import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@polytechnic.edu.ng',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      adminProfile: {
        create: {}
      }
    }
  });

  // Create department
  const department = await prisma.department.create({
    data: {
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science'
    }
  });

  // Create course
  const course = await prisma.course.create({
    data: {
      name: 'Computer Science',
      code: 'CS101',
      departmentId: department.id,
      description: 'Bachelor of Computer Science',
      duration: 4
    }
  });

  // Create teacher user
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@polytechnic.edu.ng',
      password: teacherPassword,
      name: 'John Teacher',
      role: 'TEACHER',
      teacherProfile: {
        create: {
          teacherId: 'T001',
          departmentId: department.id
        }
      }
    }
  });

  // Create student user
  const student = await prisma.user.create({
    data: {
      email: 'student@polytechnic.edu.ng',
      password: studentPassword,
      name: 'Jane Student',
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S001',
          departmentId: department.id,
          courseId: course.id,
          year: 1,
          semester: 1
        }
      }
    }
  });

  // Create subjects
  const subject1 = await prisma.subject.create({
    data: {
      name: 'Introduction to Programming',
      code: 'CS101',
      courseId: course.id,
      semester: 1,
      description: 'Basic programming concepts'
    }
  });

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Data Structures',
      code: 'CS102',
      courseId: course.id,
      semester: 1,
      description: 'Data structures and algorithms'
    }
  });

  // Create teacher-subject assignments
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacher.id,
      subjectId: subject1.id,
      classCode: 'CS101-A'
    }
  });

  await prisma.teacherSubject.create({
    data: {
      teacherId: teacher.id,
      subjectId: subject2.id,
      classCode: 'CS102-A'
    }
  });

  // Create student enrollments
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      subjectId: subject1.id
    }
  });

  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      subjectId: subject2.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('==========================================');
  console.log('Admin Credentials:');
  console.log('==========================================');
  console.log('Admin: admin@polytechnic.edu.ng / admin123');
  console.log('==========================================');
  console.log('Teacher Credentials:');
  console.log('==========================================');
  console.log('Teacher: teacher@polytechnic.edu.ng / teacher123');
  console.log('==========================================');
  console.log('Student Credentials:');
  console.log('==========================================');
  console.log('Student: student@polytechnic.edu.ng / student123');
  console.log('==========================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });