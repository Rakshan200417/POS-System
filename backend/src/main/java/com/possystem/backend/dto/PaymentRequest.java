package com.possystem.backend.dto;

import com.possystem.backend.model.PaymentType;
import lombok.Data;

public class PaymentRequest {
    private PaymentType paymentType;
    private Double amount;
    private String transactionReference;
    private Double amountTendered;
    private Double changeAmount;

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
}
