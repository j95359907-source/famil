package com.example.famil.enrollment;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.famil.course.Course;
import com.example.famil.course.CourseDao;
import com.example.famil.student.Student;
import com.example.famil.student.StudentDao;

@Service
public class EnrollmentService {

    private final EnrollmentDao enrollmentDao;
    private final StudentDao studentDao;
    private final CourseDao courseDao;

    public EnrollmentService(EnrollmentDao enrollmentDao, StudentDao studentDao, CourseDao courseDao) {
        this.enrollmentDao = enrollmentDao;
        this.studentDao = studentDao;
        this.courseDao = courseDao;
    }

    public List<Course> listCoursesByStudentId(Integer studentId) {
        if (studentId == null || !studentDao.existsById(studentId)) {
            return List.of();
        }
        return enrollmentDao.findCoursesByStudentId(studentId);
    }

    public List<Student> listStudentsByCourseId(Long courseId) {
        if (courseId == null || !courseDao.existsById(courseId)) {
            return List.of();
        }
        return enrollmentDao.findStudentsByCourseId(courseId);
    }

    @Transactional
    public boolean enroll(Integer studentId, Long courseId) {
        if (studentId == null || courseId == null) {
            return false;
        }
        if (!studentDao.existsById(studentId)) {
            return false;
        }
        if (!courseDao.existsById(courseId)) {
            return false;
        }
        if (enrollmentDao.exists(studentId, courseId)) {
            return false;
        }
        enrollmentDao.insert(studentId, courseId);
        return true;
    }

    @Transactional
    public boolean unenroll(Integer studentId, Long courseId) {
        if (studentId == null || courseId == null) {
            return false;
        }
        if (!studentDao.existsById(studentId)) {
            return false;
        }
        if (!courseDao.existsById(courseId)) {
            return false;
        }
        return enrollmentDao.delete(studentId, courseId) > 0;
    }
}

