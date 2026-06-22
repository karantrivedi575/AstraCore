package com.astracore.backend.controller;

import com.astracore.backend.model.Order;
import com.astracore.backend.model.OrderItem;
import com.astracore.backend.model.Product;
import com.astracore.backend.model.User;
import com.astracore.backend.payload.OrderItemDto;
import com.astracore.backend.payload.OrderRequest;
import com.astracore.backend.repository.OrderRepository;
import com.astracore.backend.repository.ProductRepository;
import com.astracore.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository,
                           ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequest orderRequest) {

        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order cannot be empty."));
        }

        try {
            // 1. Identify User securely via JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Initialize Order Details
            Order order = new Order();
            order.setUser(user);
            order.setFirstName(orderRequest.getShipping().getFirstName());
            order.setLastName(orderRequest.getShipping().getLastName());
            order.setEmail(orderRequest.getShipping().getEmail());
            order.setAddress(orderRequest.getShipping().getAddress());
            order.setCity(orderRequest.getShipping().getCity());
            order.setState(orderRequest.getShipping().getState());
            order.setPinCode(orderRequest.getShipping().getPinCode());
            order.setPhone(orderRequest.getShipping().getPhone());

            // 3. Process Items & Secure Backend Pricing
            BigDecimal subtotal = BigDecimal.ZERO;
            List<OrderItem> items = new ArrayList<>();

            for (OrderItemDto dto : orderRequest.getItems()) {
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(String.valueOf(dto.getId()));
                item.setProductName(dto.getName());
                item.setProductImage(dto.getImage());
                item.setProductSlug(dto.getSlug());
                item.setQuantity(dto.getQuantity());

                // SECURE TRANSACTION: Ignore frontend price. Fetch real price from DB.
                Long productId = Long.parseLong(String.valueOf(dto.getId()));
                Product realProduct = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

                BigDecimal actualPrice = realProduct.getPrice();
                item.setPrice(actualPrice);
                items.add(item);

                // Calculate line total
                BigDecimal lineTotal = actualPrice.multiply(BigDecimal.valueOf(dto.getQuantity()));
                subtotal = subtotal.add(lineTotal);
            }

            // 4. Calculate Tax and Total
            BigDecimal taxRate = new BigDecimal("0.18"); // Hardcoded Iteration 1 tax rate
            BigDecimal tax = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalAmount = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

            order.setItems(items);
            order.setSubtotal(subtotal);
            order.setTax(tax);
            order.setTotalAmount(totalAmount);
            order.setStatus("PROCESSING");

            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                "message", "Order placed successfully!", 
                "orderId", order.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to place order."));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getUserOrders() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Order> myOrders = orderRepository.findByUserOrderByIdDesc(user);
            return ResponseEntity.ok(myOrders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch orders."));
        }
    }
}