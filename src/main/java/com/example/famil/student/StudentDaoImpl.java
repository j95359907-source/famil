package com.example.famil.student;

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
public class StudentDaoImpl implements StudentDao {

    private static final RowMapper<Student> ROW_MAPPER = (rs, rowNum) -> new Student(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getInt("age")
    );

    private final JdbcTemplate jdbcTemplate;

    public StudentDaoImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Student> findAll() {
        return jdbcTemplate.query(
                "SELECT id, name, age FROM student ORDER BY id",
                ROW_MAPPER
        );
    }

    @Override
    public Optional<Student> findById(Integer id) {
        try {
            Student s = jdbcTemplate.queryForObject(
                    "SELECT id, name, age FROM student WHERE id = ?",
                    ROW_MAPPER,
                    id
            );
            return Optional.ofNullable(s);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean existsById(Integer id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student WHERE id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    @Override
    public Student insert(Student student) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO student (name, age) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, student.getName());
            if (student.getAge() != null) {
                ps.setInt(2, student.getAge());
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            student.setId(key.intValue());
        }
        return student;
    }

    @Override
    public int updateById(Integer id, Student student) {
        return jdbcTemplate.update(
                "UPDATE student SET name = ?, age = ? WHERE id = ?",
                student.getName(),
                student.getAge(),
                id
        );
    }

    @Override
    public int deleteById(Integer id) {
        return jdbcTemplate.update("DELETE FROM student WHERE id = ?", id);
    }
}

