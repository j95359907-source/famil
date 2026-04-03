package com.example.famil.enrollment;

import java.util.List;

import com.example.famil.course.Course;
import com.example.famil.student.Student;

public interface EnrollmentDao {

    List<Course> findCoursesByStudentId(Integer studentId);

    List<Student> findStudentsByCourseId(Long courseId);

    boolean exists(Integer studentId, Long courseId);

    void insert(Integer studentId, Long courseId);

    int delete(Integer studentId, Long courseId);
}

