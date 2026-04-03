package com.example.famil.student;

import java.util.List;
import java.util.Optional;

public interface StudentDao {
    List<Student> findAll();

    Optional<Student> findById(Integer id);

    boolean existsById(Integer id);

    Student insert(Student student);

    /**
     * @return 影响行数，0 表示未更新
     */
    int updateById(Integer id, Student student);

    /**
     * @return 影响行数
     */
    int deleteById(Integer id);
}

