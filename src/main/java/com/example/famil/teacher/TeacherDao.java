package com.example.famil.teacher;

import java.util.List;
import java.util.Optional;

public interface TeacherDao {

    List<Teacher> findAll();

    Optional<Teacher> findById(Long id);

    boolean existsById(Long id);

    Teacher insert(Teacher teacher);

    /** @return 影响行数，0 表示未更新 */
    int updateById(Long id, Teacher teacher);

    /** @return 影响行数 */
    int deleteById(Long id);
}
