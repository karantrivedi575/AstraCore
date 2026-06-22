package com.astracore.backend.payload;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemDto {
    @NotNull(message = "Product ID is required")
    private Long id; // Strictly Long for Iteration 1 standard products
    
    private String name;
    private Double price;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    private String image;
    private String slug;
}