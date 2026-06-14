package com.astracore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link back to the parent Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    // We store the product details as strings/numbers here instead of a direct
    // relationship to the Product table. This ensures that if a product's price
    // changes in the future, it doesn't alter past order receipts!
    private String productId;
    private String productName;
    private String productSlug;
    private String productImage;

    private java.math.BigDecimal price;
    private Integer quantity;

    @Column(length = 2000) // Ensure enough space for the PC parts text
    private String buildDetails;
}