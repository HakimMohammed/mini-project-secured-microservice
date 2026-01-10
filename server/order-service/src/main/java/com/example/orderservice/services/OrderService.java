package com.example.orderservice.services;

import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.OrderRequestDTO;
import com.example.orderservice.dto.ProductDTO;
import com.example.orderservice.entities.Order;
import com.example.orderservice.entities.OrderItem;
import com.example.orderservice.enums.OrderStatus;
import com.example.orderservice.exceptions.InsufficientStockException;
import com.example.orderservice.repositories.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public List<Order> findByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order createOrder(OrderRequestDTO request, String userId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0.0;

        for (OrderRequestDTO.ItemRequestDTO itemRequest : request.getItems()) {
            ProductDTO product = productClient.getProductById(itemRequest.getProductId());

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                                product.getName(), product.getQuantity(), itemRequest.getQuantity())
                );
            }

            OrderItem item = OrderItem.builder()
                    .productId(product.getId())
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .order(order)
                    .build();

            orderItems.add(item);
            total += item.getPrice() * item.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.VALIDATED);

        return orderRepository.save(order);
    }
}
