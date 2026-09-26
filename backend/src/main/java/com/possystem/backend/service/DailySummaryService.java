package com.possystem.backend.service;

import com.possystem.backend.model.DailySummary;
import com.possystem.backend.model.Order;
import com.possystem.backend.model.Payment;
import com.possystem.backend.model.PaymentType;
import com.possystem.backend.repository.DailySummaryRepository;
import com.possystem.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DailySummaryService {

    @Autowired
    private DailySummaryRepository dailySummaryRepository;

    @Autowired
    private OrderRepository orderRepository;

    public DailySummary calculateTodaySummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Order> todayOrders = orderRepository.findByOrderDateBetween(startOfDay, endOfDay);

        DailySummary summary = new DailySummary();
        summary.setSummaryDate(today);
        summary.setTotalOrdersCount(todayOrders.size());

        double totalRevenue = 0;
        double totalCash = 0;
        double totalCard = 0;

        for (Order order : todayOrders) {
            totalRevenue += (order.getTotalAmount() != null) ? order.getTotalAmount() : 0;
            if (order.getPayments() != null) {
                for (Payment payment : order.getPayments()) {
                    if (payment.getPaymentType() == PaymentType.CASH) {
                        totalCash += (payment.getAmount() != null) ? payment.getAmount() : 0;
                    } else if (payment.getPaymentType() == PaymentType.CARD || payment.getPaymentType() == PaymentType.QR) {
                        totalCard += (payment.getAmount() != null) ? payment.getAmount() : 0;
                    }
                }
            }
        }

        summary.setTotalRevenue(totalRevenue);
        summary.setTotalCash(totalCash);
        summary.setTotalCard(totalCard);

        return summary;
    }

    public DailySummary finalizeDay(String username) {
        LocalDate today = LocalDate.now();
        if (dailySummaryRepository.existsBySummaryDate(today)) {
            throw new RuntimeException("Day has already been finalized for today.");
        }

        DailySummary summary = calculateTodaySummary();
        summary.setFinalizedBy(username);
        summary.setFinalizedAt(LocalDateTime.now());

        return dailySummaryRepository.save(summary);
    }

    public List<DailySummary> getAllSummaries() {
        return dailySummaryRepository.findAll();
    }
}
