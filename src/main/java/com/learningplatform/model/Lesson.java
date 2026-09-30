package com.learningplatform.model;

import java.util.List;
import java.util.Objects;

/**
 * Represents a single lesson inside a course.
 */
public class Lesson {

    private String id;
    private String title;
    private int durationMinutes;
    private String summary;

    public Lesson() {
    }

    public Lesson(String id, String title, int durationMinutes, String summary) {
        this.id = id;
        this.title = title;
        this.durationMinutes = durationMinutes;
        this.summary = summary;
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

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Lesson lesson)) {
            return false;
        }
        return Objects.equals(id, lesson.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Lesson{id='" + id + "', title='" + title + "'}";
    }
}
