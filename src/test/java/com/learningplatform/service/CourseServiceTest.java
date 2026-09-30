package com.learningplatform.service;

import com.learningplatform.repository.InMemoryCourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CourseServiceTest {

    private CourseService courseService;

    @BeforeEach
    void setUp() {
        courseService = new CourseService(new InMemoryCourseRepository());
    }

    @Test
    void getAllCoursesReturnsSeedData() {
        assertFalse(courseService.getAllCourses().isEmpty());
    }

    @Test
    void getCourseByIdFindsKnownCourse() {
        assertTrue(courseService.getCourseById("java-fundamentals").isPresent());
    }

    @Test
    void getCourseByIdReturnsEmptyForUnknown() {
        assertTrue(courseService.getCourseById("no-such-course").isEmpty());
    }

    @Test
    void getFeaturedCoursesAreAllFeatured() {
        var featured = courseService.getFeaturedCourses();
        assertFalse(featured.isEmpty());
        featured.forEach(course -> assertTrue(course.isFeatured()));
    }

    @Test
    void getCoursesByCategoryFiltersAndHandlesUnknown() {
        assertEquals(2, courseService.getCoursesByCategory("Programming").size());
        assertTrue(courseService.getCoursesByCategory("No Such Category").isEmpty());
    }

    @Test
    void getAllCategoriesReturnsSortedDistinctValues() {
        var categories = courseService.getAllCategories();
        assertFalse(categories.isEmpty());
        assertEquals(categories.stream().sorted().toList(), categories);
    }
}
