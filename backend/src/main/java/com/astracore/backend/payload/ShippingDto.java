package com.astracore.backend.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShippingDto {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Pin code is required")
    private String pinCode;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
}