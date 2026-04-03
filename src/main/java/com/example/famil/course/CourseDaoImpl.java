package com.example.famil.course;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class CourseDaoImpl implements CourseDao {

    private static final RowMapper<Course> ROW_MAPPER = (rs, rowNum) -> new Course(
            rs.getLong("id"),
            rs.getString("name"),
            (rs.getObject("teacher_id") == null) ? null : rs.getLong("teacher_id")
    );

    private final JdbcTemplate jdbcTemplate;

    public CourseDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Course> findAll() {
        return jdbcTemplate.query(
                "SELECT id, name, teacher_id FROM course ORDER BY id",
                ROW_MAPPER
        );
    }

    @Override
    public Optional<Course> findById(Long id) {
        try {
            Course c = jdbcTemplate.queryForObject(
                    "SELECT id, name, teacher_id FROM course WHERE id = ?",
                    ROW_MAPPER,
                    id
            );
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsById(Long id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM course WHERE id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    @Override
    public Course insert(Course course) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO course (name, teacher_id) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, course.getName());
            if (course.getTeacherId() != null) {
                ps.setLong(2, course.getTeacherId());
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            course.setId(key.longValue());
        }
        return course;
    }

    @Override
    public int updateById(Long id, Course course) {
        return jdbcTemplate.update(
                "UPDATE course SET name = ?, teacher_id = ? WHERE id = ?",
                course.getName(),
                course.getTeacherId(),
                id
        );
    }

    @Override
    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM course WHERE id = ?", id);
    }
}

