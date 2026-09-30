package com.learningplatform.repository;

import com.learningplatform.model.Course;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryCourseRepositoryTest {

    private InMemoryCourseRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryCourseRepository();
    }

    @Test
    void findAllReturnsSeedDataset() {
        assertEquals(6, repository.findAll().size());
    }

    @Test
    void findByIdIsCaseInsensitive() {
        assertTrue(repository.findById("JAVA-FUNDAMENTALS").isPresent());
        assertTrue(repository.findById("Java-Fundamentals").isPresent());
    }

    @Test
    void findByIdReturnsEmptyForUnknownNullAndBlank() {
        assertTrue(repository.findById("no-such-course").isEmpty());
        assertTrue(repository.findById(null).isEmpty());
        assertTrue(repository.findById("   ").isEmpty());
    }

    @Test
    void findByCategoryFiltersCorrectly() {
        List<Course> programming = repository.findByCategory("Programming");
        assertEquals(2, programming.size());
        programming.forEach(course -> assertEquals("Programming", course.getCategory()));
    }

    @Test
    void findByCategoryIsCaseInsensitiveAndBlankSafe() {
        assertEquals(2, repository.findByCategory("programming").size());
        assertTrue(repository.findByCategory("No Such Category").isEmpty());
        assertEquals(6, repository.findByCategory(null).size());
        assertEquals(6, repository.findByCategory("  ").size());
    }

    @Test
    void findAllCategoriesIsSortedAndDistinct() {
        List<String> categories = repository.findAllCategories();
        assertEquals(List.of("Databases", "Design", "Programming", "Web Development"), categories);
    }

    @Test
    void everyCourseHasLessonsWithUniqueIdsAndRequiredFields() {
        for (Course course : repository.findAll()) {
            assertFalse(course.getId().isBlank());
            assertFalse(course.getTitle().isBlank());
            assertFalse(course.getInstructor().isBlank());
            assertFalse(course.getCategory().isBlank());
            assertFalse(course.getImage().isBlank());
            assertFalse(course.getLessons().isEmpty());
            var lessonIds = course.getLessons().stream().map(lesson -> lesson.getId()).toList();
            assertEquals(lessonIds.size(), new HashSet<>(lessonIds).size());
        }
    }
}
