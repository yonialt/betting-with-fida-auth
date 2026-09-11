package com.fidabet.backend.controller;

import com.fidabet.backend.service.AiOracleService;
import com.fidabet.backend.support.Bodies;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** AI Oracle endpoint (/api/ai/oracle). Public. */
@RestController
@RequestMapping("/api/ai")
public class AiOracleController {

    private final AiOracleService oracle;

    public AiOracleController(AiOracleService oracle) {
        this.oracle = oracle;
    }

    @PostMapping("/oracle")
    public Map<String, Object> oracle(@RequestBody(required = false) Map<String, Object> body) {
        String prompt = Bodies.toStr(body, "prompt", "");
        String context = Bodies.toStr(body, "marketContext", "");
        return Map.<String, Object>of("analysis", oracle.generate(prompt, context));
    }
}
