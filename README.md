# Online Learning Platform (LearnHub)

A full-stack online learning platform built with plain **Spring MVC** on the backend
and **HTML5 + CSS3 + vanilla JavaScript** on the frontend. No Spring Boot, no Thymeleaf,
no JPA, no frontend frameworks. Course content is served by a JSON API; enrollment and
lesson progress persist in the browser via `LocalStorage`.

## Technology stack

| Layer    | Technology                                         |
|----------|----------------------------------------------------|
| Language | Java 25 LTS                                        |
| Backend  | Spring Framework 7.0.x (Spring MVC, no Boot)       |
| Server   | Embedded Apache Tomcat 11 (Jakarta Servlet 6.1)    |
| JSON     | Jackson Databind                                   |
| Frontend | HTML5, CSS3 (single stylesheet), vanilla JavaScript|
| Storage  | Browser LocalStorage (no database)                 |
| Tests    | JUnit 6, spring-test (MockMvc), Hamcrest, JSON-Path|
| Build    | Apache Maven (fat jar via maven-shade-plugin)      |

## Requirements

- JDK 25 (any distribution, e.g. Microsoft Build of OpenJDK 25)
- Apache Maven 3.9+
- A modern browser (Chrome/Edge/Firefox)

Set `JAVA_HOME` to the JDK 25 installation and put `$JAVA_HOME/bin` plus Maven's
`bin` directory on `PATH` before running the commands below.

## Project structure

```text
pom.xml
src/
  main/
    java/com/learningplatform/
      App.java                    # Embedded-Tomcat entry point (java -jar)
      config/
        WebConfig.java            # @EnableWebMvc, component scan, static resource handlers, UTF-8
        WebAppInitializer.java    # Traditional WAR bootstrap (same WebConfig)
      controller/
        HomeController.java       # Clean page URLs (/, /courses, /course-details, /my-courses)
        CourseApiController.java  # JSON API: /api/courses[/featured|/categories|/{id}][?category=]
      model/
        Course.java               # id, title, description, duration, instructor, category, image, level, featured, lessons
        Lesson.java               # id, title, durationMinutes, summary
      service/
        CourseService.java        # Business layer (delegates to repository)
      repository/
        CourseRepository.java     # Data abstraction
        InMemoryCourseRepository.java  # Centralized seed dataset (6 courses, 19 lessons)
    resources/
      templates/                  # Static HTML pages (index, courses, course-details, my-courses)
      static/
        css/style.css             # Single mobile-first stylesheet
        js/                       # api.js, storage.js, app.js, home.js, courses.js, course-details.js, my-courses.js
        images/                   # Per-course SVG artwork
  test/java/com/learningplatform/
    AppTest.java
    controller/CourseApiControllerTest.java
    repository/InMemoryCourseRepositoryTest.java
    service/CourseServiceTest.java
```

## Setup instructions

1. Install JDK 25 and Maven 3.9+.
2. Clone/copy this project directory.
3. Set environment (Windows PowerShell example — adjust paths to your machine):

```powershell
$env:JAVA_HOME = "C:\path\to\jdk-25"
$env:PATH = "$env:JAVA_HOME\bin;C:\path\to\apache-maven-3.9.9\bin;" + $env:PATH
```

4. Download dependencies and compile:

```powershell
mvn -B package
```

## Build instructions

```powershell
mvn -B clean package
```

Produces `target/learning-platform-1.0.0-SNAPSHOT.jar` — a self-contained executable
jar (application classes + static assets + all runtime dependencies).

## Test instructions

```powershell
mvn -B test
```

23 tests, all passing: service logic, repository data integrity (seed size, unique lesson
IDs, category filtering, null/blank safety), REST endpoints (list, filter, 404, categories,
case-insensitive lookup) and port resolution.

## Run instructions

```powershell
java -jar target\learning-platform-1.0.0-SNAPSHOT.jar --port=8080
```

Then open <http://localhost:8080/>. The port can also be set with the `PORT`
environment variable (default `8080`).

## Feature list

Beginner requirements:

- Homepage with featured courses, hero, live platform statistics, call-to-action, footer
- Course listing with image, title, description, duration, instructor, category
- Individual course detail page (image, meta, lessons, enrollment status)
- Enroll button with confirmation feedback and duplicate prevention

Intermediate requirements:

- My Courses dashboard (enrolled courses, progress, Continue Learning, empty state)
- Progress percentage with `percent = round(completed / total * 100)`, progress bar,
  completed/total counts, Course Completed state at 100%
- Lesson completion simulation via accessible checkboxes (check/uncheck)
- Responsive mobile-first design (1 column → 2 at ≥640px → 3 at ≥960px)
- LocalStorage persistence for enrollments and lesson completion

Discovery/aids: case-insensitive multi-field search, category + duration filters,
title/duration sorting, contextual empty states, enrollment count badge in navigation.

Optional features (authentication, certificates, admin panel, video player, JDBC/MySQL)
are intentionally **not** implemented.

## LocalStorage data structure

Only `static/js/storage.js` touches storage. Keys:

- `olp_enrollments` — JSON array of enrolled course ID strings.
  Example: `["java-fundamentals", "sql-foundations"]`
- `olp_progress` — JSON object mapping course ID → `{ completedLessons: [lessonId, …] }`.
  Example: `{ "sql-foundations": { "completedLessons": ["sql-1", "sql-2"] } }`

Hardening: empty storage returns defaults; malformed JSON/shapes are ignored with a
warning; duplicate IDs are never stored; progress counts only lesson IDs that exist on
the course (clamped 0–100%, zero-lesson safe); if browser storage is unavailable the
module falls back to in-memory state for the session.

## Manual testing checklist

1. `java -jar target\learning-platform-1.0.0-SNAPSHOT.jar --port=8080`
2. Home `/` shows 3 featured cards + stats `6 / 4 / 6 / 19`, no console errors.
3. Courses `/courses` shows 6 cards; search `RAHUL` finds 1; filter Design finds 1;
   duration `long` finds 2; sort Z–A starts with Web Development; gibberish search
   shows a contextual empty message; reset restores 6.
4. Details `/course-details?id=sql-foundations`: image, 3 lessons, disabled checkboxes
   + enroll hint while not enrolled.
5. Click Enroll → pill flips to Enrolled, notice appears, nav badge `(1)`.
6. Check lessons → `33%`, `67%`, `100%` + Course Completed message; uncheck drops it.
7. Reload → enrollment + progress persist.
8. My Courses shows the card with `67%`/`100%` line and Continue Learning button.
9. Invalid `/course-details?id=nope` and missing `?id=` show friendly errors + back link.
10. DevTools Application → Clear storage → reload My Courses → empty state, badge hidden.
11. Lighthouse on Courses: accessibility/best-practices/SEO 1.0; no horizontal overflow.

## Known limitations

- No user accounts: enrollment/progress live only in the browser profile that created
  them (clearing site data removes them; they do not sync across devices or tabs live).
- The seed catalog has no zero-lesson course (the progress code guards against them).
- Optional spec features (auth, certificates, admin, video, database) are out of scope
  and not present.
- Mobile/tablet layouts were verified by mobile-first CSS rules, overflow math and
  touch-target measurement; no device-emulation screenshot tooling was available.
