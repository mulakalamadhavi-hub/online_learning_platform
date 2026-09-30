package com.learningplatform.controller;

import com.learningplatform.model.Course;
import com.learningplatform.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * JSON API for courses. The static frontend consumes these endpoints
 * with {@code fetch()} and persists enrollment state in LocalStorage.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseApiController {

    private final CourseService courseService;

    public CourseApiController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> listCourses(
            @RequestParam(value = "category", required = false) String category) {
        if (category == null || category.isBlank()) {
            return courseService.getAllCourses();
        }
        return courseService.getCoursesByCategory(category);
    }

    @GetMapping("/featured")
    public List<Course> featuredCourses() {
        return courseService.getFeaturedCourses();
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return courseService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> courseById(@PathVariable("id") String id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
