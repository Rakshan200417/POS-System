package com.possystem.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_name", nullable = false)
    private String storeName = "SuperPOS Store";

    private String email;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String currency = "Rs.";
    private Double taxRate = 10.0;

    @Column(name = "exchange_rate")
    private Double exchangeRate = 1.0;

    @Column(name = "receipt_header", columnDefinition = "TEXT")
    private String receiptHeader;

    @Column(name = "receipt_footer", columnDefinition = "TEXT")
    private String receiptFooter;

    @Column(name = "enable_sound")
    private Boolean enableSound = true;

    @Column(name = "barcode_auto_add")
    private Boolean barcodeAutoAdd = true;

    @Column(name = "auto_print_receipt")
    private Boolean autoPrintReceipt = false;

    public StoreSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Double getTaxRate() { return taxRate; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }

    public Double getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(Double exchangeRate) { this.exchangeRate = exchangeRate; }

    public String getReceiptHeader() { return receiptHeader; }
    public void setReceiptHeader(String receiptHeader) { this.receiptHeader = receiptHeader; }

    public String getReceiptFooter() { return receiptFooter; }
    public void setReceiptFooter(String receiptFooter) { this.receiptFooter = receiptFooter; }

    public Boolean getEnableSound() { return enableSound; }
    public void setEnableSound(Boolean enableSound) { this.enableSound = enableSound; }

    public Boolean getBarcodeAutoAdd() { return barcodeAutoAdd; }
    public void setBarcodeAutoAdd(Boolean barcodeAutoAdd) { this.barcodeAutoAdd = barcodeAutoAdd; }

    public Boolean getAutoPrintReceipt() { return autoPrintReceipt; }
    public void setAutoPrintReceipt(Boolean autoPrintReceipt) { this.autoPrintReceipt = autoPrintReceipt; }
}
