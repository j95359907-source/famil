package com.example.famil.teacher;

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
public class TeacherDaoImpl implements TeacherDao {

    private static final RowMapper<Teacher> ROW_MAPPER = (rs, rowNum) -> new Teacher(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("subject"));

    private final JdbcTemplate jdbcTemplate;

    public TeacherDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Teacher> findAll() {
        return jdbcTemplate.query(
                "SELECT id, name, subject FROM teacher ORDER BY id",
                ROW_MAPPER);
    }

    @Override
    public Optional<Teacher> findById(Long id) {
        try {
            Teacher t = jdbcTemplate.queryForObject(
                    "SELECT id, name, subject FROM teacher WHERE id = ?",
                    ROW_MAPPER,
                    id);
            return Optional.ofNullable(t);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsById(Long id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM teacher WHERE id = ?",
                Integer.class,
                id);
        return count != null && count > 0;
    }

    @Override
    public Teacher insert(Teacher teacher) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO teacher (name, subject) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, teacher.getName());
            if (teacher.getSubject() != null) {
                ps.setString(2, teacher.getSubject());
            } else {
                ps.setNull(2, Types.VARCHAR);
            }
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key != null) {
            teacher.setId(key.longValue());
        }
        return teacher;
    }

    @Override
    public int updateById(Long id, Teacher teacher) {
        return jdbcTemplate.update(
                "UPDATE teacher SET name = ?, subject = ? WHERE id = ?",
                teacher.getName(),
                teacher.getSubject(),
                id);
    }

    @Override
    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM teacher WHERE id = ?", id);
    }
}
