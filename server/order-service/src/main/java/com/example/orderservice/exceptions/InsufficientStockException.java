package com.example.orderservice.exceptions;

public class InsufficientStockExcpetion extends RuntimeException {
    public InsufficientStockExcpetion(String message) {
        super(message);
    }
}
