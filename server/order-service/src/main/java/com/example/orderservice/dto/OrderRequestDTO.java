package com.example.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDTO {
    
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<ItemRequestDTO> items;

    @Data
    public static class ItemRequestDTO {
        
        @NotBlank(message = "Product ID is required")
        private String productId;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}