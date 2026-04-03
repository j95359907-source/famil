package com.example.famil.web;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StaticPagesController {

    private ResponseEntity<Resource> serveStaticHtml(String fileName) {
        // 从 classpath:/static/{fileName} 读取（避免仅依赖默认静态资源映射造成 404）。
        Resource resource = new ClassPathResource("static/" + fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    @GetMapping({"/", "/index.html"})
    public ResponseEntity<Resource> index() {
        return serveStaticHtml("index.html");
    }

    @GetMapping("/static/")
    public ResponseEntity<Resource> staticRoot() {
        return serveStaticHtml("index.html");
    }

    @GetMapping("/login.html")
    public ResponseEntity<Resource> login() {
        return serveStaticHtml("login.html");
    }

    @GetMapping("/teachers.html")
    public ResponseEntity<Resource> teachers() {
        return serveStaticHtml("teachers.html");
    }

    @GetMapping({"/teachers", "/static/teachers.html", "/static/teachers"})
    public ResponseEntity<Resource> teachersNoExtOrStaticPrefix() {
        return serveStaticHtml("teachers.html");
    }

    @GetMapping("/students.html")
    public ResponseEntity<Resource> students() {
        return serveStaticHtml("students.html");
    }

    @GetMapping({"/students", "/static/students.html", "/static/students"})
    public ResponseEntity<Resource> studentsNoExtOrStaticPrefix() {
        return serveStaticHtml("students.html");
    }

    @GetMapping("/courses.html")
    public ResponseEntity<Resource> courses() {
        return serveStaticHtml("courses.html");
    }

    @GetMapping({"/courses", "/static/courses.html", "/static/courses"})
    public ResponseEntity<Resource> coursesNoExtOrStaticPrefix() {
        return serveStaticHtml("courses.html");
    }
}

