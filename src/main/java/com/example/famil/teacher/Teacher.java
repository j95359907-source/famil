package com.example.famil.teacher;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    private Long id;
    private String name;
    /** 任教科目 */
    private String subject;
}
