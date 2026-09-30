package com.learningplatform.repository;

import com.learningplatform.model.Course;

import java.util.List;
import java.util.Optional;

/**
 * Data abstraction for courses. Backed by an in-memory
 * implementation for now so no database dependency is required.
 */
public interface CourseRepository {

    List<Course> findAll();

    Optional<Course> findById(String id);

    List<Course> findFeatured();

    List<Course> findByCategory(String category);

    List<String> findAllCategories();
}
