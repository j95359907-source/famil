package com.example.famil.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    private Long id;
    private String name;
    /** 关联的老师 id（允许为空） */
    private Long teacherId;
}

