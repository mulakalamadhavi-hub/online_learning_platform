package com.learningplatform;

import com.learningplatform.config.WebConfig;
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.DispatcherServlet;

import java.io.File;
import java.nio.file.Files;

/**
 * Application entry point using embedded Tomcat 11.
 *
 * <p>This is plain Spring MVC — no Spring Boot. The class only wires
 * the Servlet container to the Spring {@link DispatcherServlet}.</p>
 */
public class App {

    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) throws Exception {
        int port = resolvePort(args);
        File docBase = Files.createTempDirectory("olp-tomcat-base").toFile();
        docBase.deleteOnExit();

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.getConnector();

        Context context = tomcat.addContext("", docBase.getAbsolutePath());

        // Force UTF-8 on every response so static HTML/CSS/JS carry an
        // explicit charset instead of the container default (ISO-8859-1).
        FilterDef encodingFilterDef = new FilterDef();
        encodingFilterDef.setFilterName("characterEncodingFilter");
        encodingFilterDef.setFilter(new CharacterEncodingFilter("UTF-8", true, true));
        context.addFilterDef(encodingFilterDef);
        FilterMap encodingFilterMap = new FilterMap();
        encodingFilterMap.setFilterName("characterEncodingFilter");
        encodingFilterMap.addURLPattern("/*");
        context.addFilterMap(encodingFilterMap);

        AnnotationConfigWebApplicationContext springContext = new AnnotationConfigWebApplicationContext();
        springContext.register(WebConfig.class);

        DispatcherServlet dispatcherServlet = new DispatcherServlet(springContext);
        var wrapper = Tomcat.addServlet(context, "dispatcher", dispatcherServlet);
        wrapper.setLoadOnStartup(1);
        // "/*" (not "/") so the DispatcherServlet wins over Tomcat's
        // built-in DefaultServlet in embedded mode. Static content is
        // served from the classpath by Spring resource handlers.
        context.addServletMappingDecoded("/*", "dispatcher");

        tomcat.start();
        System.out.println("Online Learning Platform started at http://localhost:" + port);
        tomcat.getServer().await();
    }

    static int resolvePort(String[] args) {
        if (args != null) {
            for (String arg : args) {
                if (arg != null && arg.startsWith("--port=")) {
                    try {
                        return Integer.parseInt(arg.substring("--port=".length()).trim());
                    } catch (NumberFormatException ignored) {
                        return DEFAULT_PORT;
                    }
                }
            }
        }
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                return Integer.parseInt(envPort.trim());
            } catch (NumberFormatException ignored) {
                return DEFAULT_PORT;
            }
        }
        return DEFAULT_PORT;
    }
}
