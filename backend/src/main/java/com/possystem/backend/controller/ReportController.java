package com.possystem.backend.controller;

import com.possystem.backend.model.Order;
import com.possystem.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Order> orders = orderRepository.findByOrderDateBetween(startDate, endDate);

        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        int totalOrders = orders.size();

        Map<String, Object> report = new HashMap<>();
        report.put("totalSales", totalSales);
        report.put("totalOrders", totalOrders);
        report.put("orders", orders);

        return report;
    }
}
