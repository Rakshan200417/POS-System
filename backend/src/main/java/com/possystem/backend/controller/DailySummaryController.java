package com.possystem.backend.controller;

import com.possystem.backend.model.DailySummary;
import com.possystem.backend.security.services.UserDetailsImpl;
import com.possystem.backend.service.DailySummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports/daily")
public class DailySummaryController {

    @Autowired
    private DailySummaryService dailySummaryService;

    @GetMapping("/today")
    @PreAuthorize("hasRole('CASHIER') or hasRole('ADMIN')")
    public ResponseEntity<DailySummary> getTodaySummary() {
        DailySummary summary = dailySummaryService.calculateTodaySummary();
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasRole('CASHIER') or hasRole('ADMIN')")
    public ResponseEntity<?> finalizeDay() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = "System";
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            username = userDetails.getUsername();
        }

        try {
            DailySummary summary = dailySummaryService.finalizeDay(username);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailySummary>> getAllSummaries() {
        return ResponseEntity.ok(dailySummaryService.getAllSummaries());
    }
}
