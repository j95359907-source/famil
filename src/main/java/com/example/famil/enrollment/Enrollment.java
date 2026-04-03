package com.example.famil.enrollment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {
    private Long id;
    private Integer studentId;
    private Long courseId;
}

