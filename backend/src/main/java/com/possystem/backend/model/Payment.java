package com.possystem.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    private Double amount;

    private String transactionReference;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "amount_tendered")
    private Double amountTendered;

    @Column(name = "change_amount")
    private Double changeAmount;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    @PrePersist
    protected void onCreate() {
        paymentDate = LocalDateTime.now();
    }

    public Payment() {
    }

    public Payment(PaymentType paymentType, Double amount, String transactionReference) {
        this.paymentType = paymentType;
        this.amount = amount;
        this.transactionReference = transactionReference;
    }

    public Payment(PaymentType paymentType, Double amount, String transactionReference, Double amountTendered, Double changeAmount) {
        this.paymentType = paymentType;
        this.amount = amount;
        this.transactionReference = transactionReference;
        this.amountTendered = amountTendered;
        this.changeAmount = changeAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Double getAmountTendered() {
        return amountTendered;
    }

    public void setAmountTendered(Double amountTendered) {
        this.amountTendered = amountTendered;
    }

    public Double getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(Double changeAmount) {
        this.changeAmount = changeAmount;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }
}
