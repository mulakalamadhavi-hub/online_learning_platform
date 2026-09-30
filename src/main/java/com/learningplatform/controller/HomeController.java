package com.learningplatform.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the static HTML pages with clean URLs.
 * The HTML files live under {@code classpath:/templates/} and are
 * exposed through Spring MVC resource handling (see WebConfig).
 */
@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/courses")
    public String courses() {
        return "forward:/courses.html";
    }

    @GetMapping("/course-details")
    public String courseDetails() {
        return "forward:/course-details.html";
    }

    @GetMapping("/my-courses")
    public String myCourses() {
        return "forward:/my-courses.html";
    }
}
