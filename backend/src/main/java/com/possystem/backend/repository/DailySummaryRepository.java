package com.possystem.backend.repository;

import com.possystem.backend.model.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, Long> {
    Optional<DailySummary> findBySummaryDate(LocalDate summaryDate);
    boolean existsBySummaryDate(LocalDate summaryDate);
}
