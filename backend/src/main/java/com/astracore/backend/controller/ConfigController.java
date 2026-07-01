package com.astracore.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Value("${astracore.tax.rate}")
    private String taxRate;

    @GetMapping("/tax-rate")
    public ResponseEntity<?> getTaxRate() {
        return ResponseEntity.ok(Map.of("taxRate", Double.parseDouble(taxRate)));
    }
}