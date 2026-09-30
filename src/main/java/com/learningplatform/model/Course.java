package com.learningplatform.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Domain model for a course.
 *
 * <p>Kept persistence-free on purpose: the current phase uses an
 * in-memory repository. No JPA/Hibernate annotations are used.</p>
 */
public class Course {

    private String id;
    private String title;
    private String description;
    private String duration;
    private String instructor;
    private String category;
    private String image;
    private String level;
    private boolean featured;
    private List<Lesson> lessons = new ArrayList<>();

    public Course() {
    }

    public Course(String id, String title, String description, String duration,
                  String instructor, String category, String image,
                  String level, boolean featured, List<Lesson> lessons) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.duration = duration;
        this.instructor = instructor;
        this.category = category;
        this.image = image;
        this.level = level;
        this.featured = featured;
        this.lessons = lessons == null ? new ArrayList<>() : new ArrayList<>(lessons);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public List<Lesson> getLessons() {
        return lessons;
    }

    public void setLessons(List<Lesson> lessons) {
        this.lessons = lessons == null ? new ArrayList<>() : new ArrayList<>(lessons);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Course course)) {
            return false;
        }
        return Objects.equals(id, course.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Course{id='" + id + "', title='" + title + "'}";
    }
}
