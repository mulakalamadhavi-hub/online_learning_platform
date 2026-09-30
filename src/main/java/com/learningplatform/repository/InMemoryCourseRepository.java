package com.learningplatform.repository;

import com.learningplatform.model.Course;
import com.learningplatform.model.Lesson;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Centralized in-memory course dataset.
 *
 * <p>All seed data lives here and only here, so the frontend and
 * service layer share a single source of truth via the API.</p>
 */
@Repository
public class InMemoryCourseRepository implements CourseRepository {

    private final List<Course> courses;

    public InMemoryCourseRepository() {
        this.courses = Collections.unmodifiableList(seedCourses());
    }

    @Override
    public List<Course> findAll() {
        return courses;
    }

    @Override
    public Optional<Course> findById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        return courses.stream()
                .filter(course -> course.getId().equalsIgnoreCase(id.trim()))
                .findFirst();
    }

    @Override
    public List<Course> findFeatured() {
        return courses.stream()
                .filter(Course::isFeatured)
                .toList();
    }

    @Override
    public List<Course> findByCategory(String category) {
        if (category == null || category.isBlank()) {
            return courses;
        }
        String normalized = category.trim();
        return courses.stream()
                .filter(course -> course.getCategory().equalsIgnoreCase(normalized))
                .toList();
    }

    @Override
    public List<String> findAllCategories() {
        return courses.stream()
                .map(Course::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * The single place where initial course content is defined.
     */
    private static List<Course> seedCourses() {
        List<Course> seed = new ArrayList<>();

        seed.add(new Course(
                "java-fundamentals",
                "Java Fundamentals",
                "Learn Java 25 from scratch: syntax, OOP, collections, streams and error handling with hands-on exercises.",
                "12 hours",
                "Ananya Sharma",
                "Programming",
                "images/course-java.svg",
                "Beginner",
                true,
                List.of(
                        new Lesson("java-1", "Getting Started with Java 25", 25, "Install the JDK, write your first program and understand compilation."),
                        new Lesson("java-2", "Object-Oriented Programming", 45, "Classes, objects, inheritance, interfaces and records."),
                        new Lesson("java-3", "Collections and Streams", 50, "Lists, maps, sets and functional-style data processing."),
                        new Lesson("java-4", "Error Handling and Best Practices", 35, "Exceptions, validation and clean code habits.")
                )
        ));

        seed.add(new Course(
                "spring-mvc-web",
                "Web Development with Spring MVC",
                "Build server-rendered web apps with Spring Framework 7 and Spring MVC: controllers, forms, validation and static assets.",
                "10 hours",
                "Rahul Verma",
                "Web Development",
                "images/course-spring.svg",
                "Intermediate",
                true,
                List.of(
                        new Lesson("spring-1", "MVC Architecture Explained", 30, "DispatcherServlet, controllers, models and views."),
                        new Lesson("spring-2", "Building Controllers and Routes", 45, "Request mappings, path variables and form handling."),
                        new Lesson("spring-3", "Serving Static Content", 30, "CSS, JavaScript and image handling with resource handlers.")
                )
        ));

        seed.add(new Course(
                "frontend-basics",
                "Frontend Basics: HTML, CSS and JavaScript",
                "Master semantic HTML, modern CSS layouts and vanilla JavaScript with LocalStorage persistence.",
                "14 hours",
                "Priya Nair",
                "Web Development",
                "images/course-frontend.svg",
                "Beginner",
                true,
                List.of(
                        new Lesson("fe-1", "Semantic HTML", 30, "Structure pages accessibly with semantic elements."),
                        new Lesson("fe-2", "Responsive CSS", 45, "Flexbox, grid and mobile-first responsive design."),
                        new Lesson("fe-3", "Vanilla JavaScript and LocalStorage", 50, "DOM manipulation, fetch and client-side persistence.")
                )
        ));

        seed.add(new Course(
                "data-structures",
                "Data Structures in Java",
                "Understand arrays, linked lists, stacks, queues, trees and Big-O analysis with Java implementations.",
                "16 hours",
                "Vikram Rao",
                "Programming",
                "images/course-dsa.svg",
                "Intermediate",
                false,
                List.of(
                        new Lesson("dsa-1", "Complexity Analysis", 35, "Big-O notation and measuring performance."),
                        new Lesson("dsa-2", "Linear Structures", 50, "Arrays, lists, stacks and queues."),
                        new Lesson("dsa-3", "Trees and Searching", 55, "Binary trees, traversal and search strategies.")
                )
        ));

        seed.add(new Course(
                "sql-foundations",
                "SQL Foundations",
                "Learn relational concepts, SELECT queries, joins, aggregation and safe database design practices.",
                "8 hours",
                "Kavya Menon",
                "Databases",
                "images/course-sql.svg",
                "Beginner",
                false,
                List.of(
                        new Lesson("sql-1", "Relational Model Basics", 25, "Tables, keys and relationships."),
                        new Lesson("sql-2", "Querying with SELECT", 45, "Filtering, sorting, joins and aggregation."),
                        new Lesson("sql-3", "Designing Clean Schemas", 35, "Normalization and constraints.")
                )
        ));

        seed.add(new Course(
                "design-thinking",
                "Design Thinking for Developers",
                "Apply user-centered design, wireframing and usability basics to build clearer learning interfaces.",
                "6 hours",
                "Arjun Patel",
                "Design",
                "images/course-design.svg",
                "Beginner",
                false,
                List.of(
                        new Lesson("dt-1", "Empathize and Define", 30, "User research and problem framing."),
                        new Lesson("dt-2", "Ideate and Prototype", 40, "Sketching flows and low-fidelity prototypes."),
                        new Lesson("dt-3", "Test and Iterate", 30, "Usability checks and iteration loops.")
                )
        ));

        return seed;
    }
}
