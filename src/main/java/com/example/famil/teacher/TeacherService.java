package com.example.famil.teacher;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {

    private final TeacherDao teacherDao;

    public TeacherService(TeacherDao teacherDao) {
        this.teacherDao = teacherDao;
    }

    public List<Teacher> listAll() {
        return teacherDao.findAll();
    }

    public Optional<Teacher> findById(Long id) {
        return teacherDao.findById(id);
    }

    @Transactional
    public Teacher create(Teacher teacher) {
        teacher.setId(null);
        return teacherDao.insert(teacher);
    }

    @Transactional
    public Optional<Teacher> update(Long id, Teacher data) {
        if (!teacherDao.existsById(id)) {
            return Optional.empty();
        }
        if (teacherDao.updateById(id, data) == 0) {
            return Optional.empty();
        }
        return teacherDao.findById(id);
    }

    @Transactional
    public boolean deleteById(Long id) {
        return teacherDao.deleteById(id) > 0;
    }
}
