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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

  
    private String productId;
    private String productName;
    private String productSlug;
    private String productImage;

    private java.math.BigDecimal price;
    private Integer quantity;

    @Column(length = 2000) 
    private String buildDetails;
}