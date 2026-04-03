package com.example.famil.course;

import java.util.List;
import java.util.Optional;

public interface CourseDao {
    List<Course> findAll();

    Optional<Course> findById(Long id);

    boolean existsById(Long id);

    Course insert(Course course);

    int updateById(Long id, Course course);

    int deleteById(Long id);
}

