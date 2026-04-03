package com.example.famil.student;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {
    private final StudentDao studentDao;

    public StudentService(StudentDao studentDao) {
        this.studentDao = studentDao;
    }

    public List<Student> listAll() {
        return studentDao.findAll();
    }

    public Optional<Student> findById(Integer id) {
        return studentDao.findById(id);
    }

    @Transactional
    public Student create(Student student) {
        student.setId(null);
        return studentDao.insert(student);
    }

    @Transactional
    public Optional<Student> update(Integer id, Student data) {
        if (!studentDao.existsById(id)) {
            return Optional.empty();
        }
        if (studentDao.updateById(id, data) == 0) {
            return Optional.empty();
        }
        return studentDao.findById(id);
    }

    @Transactional
    public boolean deleteById(Integer id) {
        return studentDao.deleteById(id) > 0;
    }
}

