package com.astracore.backend.payload;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    @Valid
    @NotNull(message = "Shipping details are required")
    private ShippingDto shipping;
    
    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemDto> items;
}