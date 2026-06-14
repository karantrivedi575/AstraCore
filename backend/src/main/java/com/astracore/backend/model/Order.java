package com.astracore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link this order to a specific user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Shipping Details (Matches your React Checkout form)
    private String firstName;
    private String lastName;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String phone;

    // Financials
    private java.math.BigDecimal subtotal;
    private java.math.BigDecimal tax;
    private java.math.BigDecimal totalAmount;

    // Order Status
    private String status = "PENDING"; // PENDING, PROCESSING, SHIPPED, DELIVERED

    private LocalDateTime orderDate;

    // Link to the items inside the order
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
    }
}