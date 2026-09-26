package com.possystem.backend.repository;

import com.possystem.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);

    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
