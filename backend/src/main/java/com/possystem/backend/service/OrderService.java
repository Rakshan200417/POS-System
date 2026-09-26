package com.possystem.backend.service;

import com.possystem.backend.dto.OrderItemRequest;
import com.possystem.backend.dto.OrderRequest;
import com.possystem.backend.dto.PaymentRequest;
import com.possystem.backend.model.*;
import com.possystem.backend.repository.CustomerRepository;
import com.possystem.backend.repository.OrderRepository;
import com.possystem.backend.repository.ProductRepository;
import com.possystem.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Order createOrder(OrderRequest request, Long cashierId) {
        Order order = new Order();
        
        // Generate a modern, readable invoice number (e.g., INV-A4B7D91C)
        String shortId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        order.setInvoiceNumber("INV-" + shortId);
        
        order.setStatus("COMPLETED"); // Assuming immediate completion for POS

        // Set Customer if present
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            order.setCustomer(customer);
            // Add loyalty points logic here if needed (e.g., 1 point per 10 currency units)
        }

        // Set Cashier
        if (cashierId != null) {
            userRepository.findById(cashierId).ifPresent(order::setCashier);
        }

        double totalAmount = 0.0;

        // Process Items
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct Stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // Create Order Item
            OrderItem orderItem = new OrderItem(product, itemRequest.getQuantity(), product.getPrice());
            order.addOrderItem(orderItem);

            totalAmount += orderItem.getSubTotal();
        }

        order.setTotalAmount(totalAmount);

        // Process Payments
        double paidAmount = 0.0;
        if (request.getPayments() != null) {
            for (PaymentRequest paymentRequest : request.getPayments()) {
                Payment payment = new Payment(paymentRequest.getPaymentType(), paymentRequest.getAmount(),
                        paymentRequest.getTransactionReference());
                payment.setAmountTendered(paymentRequest.getAmountTendered());
                payment.setChangeAmount(paymentRequest.getChangeAmount());
                order.addPayment(payment);
                paidAmount += paymentRequest.getAmount();
            }
        }

        // Basic validation (optional, can allow partial payment if debt is allowed)
        if (paidAmount < totalAmount) {
            // For now, let's assume strict payment
            // throw new RuntimeException("Insufficient payment");
        }

        return orderRepository.save(order);
    }
}
