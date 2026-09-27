package com.possystem.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String sku;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @NotNull
    private Double price;

    @NotNull
    private Integer stock;

    @Column(name = "min_stock_level")
    private Integer minStockLevel;

    @Column(name = "member_discount_percentage")
    private Double memberDiscountPercentage = 0.0;

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    public Product() {
    }

    public Product(String sku, String name, Double price, Integer stock, Integer minStockLevel) {
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.minStockLevel = minStockLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public Double getMemberDiscountPercentage() {
        return memberDiscountPercentage;
    }

    public void setMemberDiscountPercentage(Double memberDiscountPercentage) {
        this.memberDiscountPercentage = memberDiscountPercentage != null ? memberDiscountPercentage : 0.0;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
