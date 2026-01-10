package com.example.orderservice.controllers;

import com.example.orderservice.dto.OrderRequestDTO;
import com.example.orderservice.entities.Order;
import com.example.orderservice.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Order> create(@Valid @RequestBody OrderRequestDTO request,
                                        @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return new ResponseEntity<>(orderService.createOrder(request, userId), HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(orderService.findByUserId(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }
}
