package com.learningplatform;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AppTest {

    @Test
    void resolvePortUsesExplicitArgument() {
        assertEquals(9090, App.resolvePort(new String[]{"--port=9090"}));
    }

    @Test
    void resolvePortFallsBackOnMissingOrInvalidInput() {
        assertEquals(8080, App.resolvePort(null));
        assertEquals(8080, App.resolvePort(new String[]{}));
        assertEquals(8080, App.resolvePort(new String[]{"--port=not-a-number"}));
        assertEquals(8080, App.resolvePort(new String[]{"--other=9090"}));
    }
}
