package com.learningplatform.service;

import com.learningplatform.model.Course;
import com.learningplatform.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Business layer for courses. Controllers delegate here;
 * no HTTP or persistence details leak into this class.
 */
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
    }

    public List<Course> getFeaturedCourses() {
        return courseRepository.findFeatured();
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<String> getAllCategories() {
        return courseRepository.findAllCategories();
    }
}
