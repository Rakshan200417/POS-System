package com.possystem.backend.dto;

import lombok.Data;
import java.util.List;

public class OrderRequest {
    private Long customerId;
    private List<OrderItemRequest> items;
    private List<PaymentRequest> payments;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public List<PaymentRequest> getPayments() {
        return payments;
    }

    public void setPayments(List<PaymentRequest> payments) {
        this.payments = payments;
    }
}
