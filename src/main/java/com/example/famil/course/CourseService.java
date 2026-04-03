package com.example.famil.course;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {
    private final CourseDao courseDao;

    public CourseService(CourseDao courseDao) {
        this.courseDao = courseDao;
    }

    public List<Course> listAll() {
        return courseDao.findAll();
    }

    public Optional<Course> findById(Long id) {
        return courseDao.findById(id);
    }

    @Transactional
    public Course create(Course course) {
        course.setId(null);
        return courseDao.insert(course);
    }

    @Transactional
    public Optional<Course> update(Long id, Course data) {
        if (!courseDao.existsById(id)) {
            return Optional.empty();
        }
        if (courseDao.updateById(id, data) == 0) {
            return Optional.empty();
        }
        return courseDao.findById(id);
    }

    @Transactional
    public boolean deleteById(Long id) {
        return courseDao.deleteById(id) > 0;
    }
}

