package com.learningplatform.config;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.DispatcherServlet;

import java.util.EnumSet;

/**
 * Servlet-container bootstrap for traditional WAR deployment.
 * The embedded {@link com.learningplatform.App} entry point reuses
 * the same {@link WebConfig} for {@code java -jar} / IDE runs.
 */
public class WebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(WebConfig.class);

        // Force UTF-8 so static HTML/CSS/JS responses carry an explicit charset.
        CharacterEncodingFilter encodingFilter = new CharacterEncodingFilter("UTF-8", true, true);
        servletContext.addFilter("characterEncodingFilter", encodingFilter)
                .addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), false, "/*");

        DispatcherServlet dispatcherServlet = new DispatcherServlet(context);
        var registration = servletContext.addServlet("dispatcher", dispatcherServlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/");
    }
}
