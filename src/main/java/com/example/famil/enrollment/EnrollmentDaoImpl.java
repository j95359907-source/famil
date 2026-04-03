package com.example.famil.enrollment;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

import com.example.famil.course.Course;
import com.example.famil.student.Student;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class EnrollmentDaoImpl implements EnrollmentDao {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Course> COURSE_ROW_MAPPER = (rs, rowNum) -> new Course(
            rs.getLong("id"),
            rs.getString("name"),
            (rs.getObject("teacher_id") == null) ? null : rs.getLong("teacher_id")
    );

    private static final RowMapper<Student> STUDENT_ROW_MAPPER = (rs, rowNum) -> new Student(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getInt("age")
    );

    public EnrollmentDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> findCoursesByStudentId(Integer studentId) {
        return jdbcTemplate.query(
                "SELECT c.id, c.name, c.teacher_id " +
                        "FROM course c " +
                        "JOIN enrollment e ON e.course_id = c.id " +
                        "WHERE e.student_id = ? " +
                        "ORDER BY c.id",
                COURSE_ROW_MAPPER,
                studentId
        );
    }

    @Override
    public List<Student> findStudentsByCourseId(Long courseId) {
        return jdbcTemplate.query(
                "SELECT s.id, s.name, s.age " +
                        "FROM student s " +
                        "JOIN enrollment e ON e.student_id = s.id " +
                        "WHERE e.course_id = ? " +
                        "ORDER BY s.id",
                STUDENT_ROW_MAPPER,
                courseId
        );
    }

    @Override
    public boolean exists(Integer studentId, Long courseId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM enrollment WHERE student_id = ? AND course_id = ?",
                Integer.class,
                studentId,
                courseId
        );
        return count != null && count > 0;
    }

    @Override
    public void insert(Integer studentId, Long courseId) {
        // 无需返回自增 id，前端只需要知道成功/失败。
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO enrollment (student_id, course_id) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setInt(1, studentId);
            ps.setLong(2, courseId);
            return ps;
        }, keyHolder);
    }

    @Override
    public int delete(Integer studentId, Long courseId) {
        return jdbcTemplate.update(
                "DELETE FROM enrollment WHERE student_id = ? AND course_id = ?",
                studentId,
                courseId
        );
    }
}

