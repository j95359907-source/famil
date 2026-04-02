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
        return teacherDao.save(teacher);
    }

    @Transactional
    public Optional<Teacher> update(Long id, Teacher data) {
        return teacherDao.findById(id).map(existing -> {
            existing.setName(data.getName());
            existing.setSubject(data.getSubject());
            return teacherDao.save(existing);
        });
    }

    @Transactional
    public boolean deleteById(Long id) {
        if (!teacherDao.existsById(id)) {
            return false;
        }
        teacherDao.deleteById(id);
        return true;
    }
}
