package com.example.famil.enrollment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.famil.course.Course;
import com.example.famil.student.Student;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/students/{studentId}")
    public List<Course> listCoursesByStudent(@PathVariable Integer studentId) {
        return enrollmentService.listCoursesByStudentId(studentId);
    }

    @GetMapping("/courses/{courseId}")
    public List<Student> listStudentsByCourse(@PathVariable Long courseId) {
        return enrollmentService.listStudentsByCourseId(courseId);
    }

    public static class CreateEnrollmentRequest {
        private Integer studentId;
        private Long courseId;

        public Integer getStudentId() {
            return studentId;
        }

        public void setStudentId(Integer studentId) {
            this.studentId = studentId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }
    }

    @PostMapping
    public ResponseEntity<Void> enroll(@RequestBody CreateEnrollmentRequest req) {
        boolean ok = enrollmentService.enroll(req.getStudentId(), req.getCourseId());
        if (!ok) {
            // 既存关系/非法学生课程都用 400 表示
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/students/{studentId}/courses/{courseId}")
    public ResponseEntity<Void> unenroll(
            @PathVariable Integer studentId,
            @PathVariable Long courseId
    ) {
        boolean ok = enrollmentService.unenroll(studentId, courseId);
        if (!ok) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}

