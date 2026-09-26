package com.possystem.backend.controller;

import com.possystem.backend.model.Product;
import com.possystem.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    @PreAuthorize("hasRole('CASHIER') or hasRole('ADMIN')")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CASHIER') or hasRole('ADMIN')")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productService.getProductById(id)
                .map(product -> {
                    if (productDetails.getName() != null) product.setName(productDetails.getName());
                    if (productDetails.getSku() != null) product.setSku(productDetails.getSku());
                    if (productDetails.getPrice() != null) product.setPrice(productDetails.getPrice());
                    if (productDetails.getStock() != null) product.setStock(productDetails.getStock());
                    if (productDetails.getDescription() != null) product.setDescription(productDetails.getDescription());
                    if (productDetails.getMinStockLevel() != null) product.setMinStockLevel(productDetails.getMinStockLevel());
                    if (productDetails.getMemberDiscountPercentage() != null) product.setMemberDiscountPercentage(productDetails.getMemberDiscountPercentage());
                    return ResponseEntity.ok(productService.saveProduct(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> adjustStock(@PathVariable Long id, @RequestParam Integer stock) {
        return productService.getProductById(id)
                .map(product -> {
                    product.setStock(stock);
                    return ResponseEntity.ok(productService.saveProduct(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(product -> {
                    productService.deleteProduct(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/convert-currency")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> convertAllPrices(@RequestParam Double rate) {
        if (rate == null || rate <= 0) {
            return ResponseEntity.badRequest().body("Invalid exchange rate");
        }
        var products = productService.getAllProducts();
        for (var p : products) {
            if (p.getPrice() != null) {
                p.setPrice(Math.round(p.getPrice() * rate * 100.0) / 100.0);
                productService.saveProduct(p);
            }
        }
        return ResponseEntity.ok("Successfully updated " + products.size() + " product prices with rate " + rate);
    }
}
