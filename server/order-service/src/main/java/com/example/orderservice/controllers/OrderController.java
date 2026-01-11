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

    /**
     * Creates a new order for the authenticated user.
     * Validates product availability before creating the order.
     * @param request Order details with product items
     * @param jwt JWT token containing user identity
     * @return Created order
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<Order> create(@Valid @RequestBody OrderRequestDTO request,
                                        @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return new ResponseEntity<>(orderService.createOrder(request, userId), HttpStatus.CREATED);
    }

    /**
     * Retrieves all orders for the authenticated user.
     * @param jwt JWT token containing user identity
     * @return List of user's orders
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(orderService.findByUserId(userId));
    }

    /**
     * Retrieves all orders in the system. Only accessible by ADMIN users.
     * @return List of all orders
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }
}
