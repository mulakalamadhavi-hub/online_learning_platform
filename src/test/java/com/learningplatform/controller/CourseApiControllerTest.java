package com.learningplatform.controller;

import com.learningplatform.config.WebConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringJUnitWebConfig(WebConfig.class)
class CourseApiControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc() {
        return MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void listCoursesReturnsJsonArray() throws Exception {
        mockMvc().perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].lessons").exists());
    }

    @Test
    void courseByIdReturnsSingleCourse() throws Exception {
        mockMvc().perform(get("/api/courses/java-fundamentals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("java-fundamentals"));
    }

    @Test
    void courseByIdReturns404ForUnknown() throws Exception {
        mockMvc().perform(get("/api/courses/unknown-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void featuredEndpointReturnsOnlyFeatured() throws Exception {
        mockMvc().perform(get("/api/courses/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].featured").value(true));
    }

    @Test
    void listCoursesFiltersByCategory() throws Exception {
        mockMvc().perform(get("/api/courses").param("category", "Programming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].category").value("Programming"));
    }

    @Test
    void listCoursesReturnsEmptyForUnknownCategory() throws Exception {
        mockMvc().perform(get("/api/courses").param("category", "No Such Category"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void categoriesEndpointReturnsSortedCategories() throws Exception {
        mockMvc().perform(get("/api/courses/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Databases"));
    }

    @Test
    void courseByIdLookupIsCaseInsensitive() throws Exception {
        mockMvc().perform(get("/api/courses/JAVA-FUNDAMENTALS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("java-fundamentals"));
    }
}
