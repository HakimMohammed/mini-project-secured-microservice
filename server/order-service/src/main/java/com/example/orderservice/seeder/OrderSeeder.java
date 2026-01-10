package com.example.orderservice.seeder;

import com.example.orderservice.client.ProductClient;
import com.example.orderservice.dto.OrderRequestDTO;
import com.example.orderservice.dto.ProductDTO;
import com.example.orderservice.repositories.OrderRepository;
import com.example.orderservice.services.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

//@Configuration
@RequiredArgsConstructor
@Slf4j
public class OrderSeeder implements CommandLineRunner {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            log.info("Orders already exist. Skipping seeding.");
            return;
        }

        try {
            List<ProductDTO> existingProducts = productClient.getAll();

            if (existingProducts.isEmpty()) {
                log.warn("No products found in Product Service. Skipping Order Seeding.");
                return;
            }

            for (int i = 0; i < 10; i++) {
                OrderRequestDTO request = new OrderRequestDTO();
                List<OrderRequestDTO.ItemRequestDTO> items = new ArrayList<>();

                int numberOfProducts = random.nextInt(5) + 1;
                for (int j = 0; j < numberOfProducts; j++) {
                    ProductDTO randomProduct = existingProducts.get(random.nextInt(existingProducts.size()));

                    OrderRequestDTO.ItemRequestDTO item = new OrderRequestDTO.ItemRequestDTO();
                    item.setProductId(randomProduct.getId());
                    item.setQuantity(random.nextInt(3) + 1);
                    items.add(item);
                }

                request.setItems(items);
                
                // Generate a fake user ID for seeding
                String fakeUserId = "seed-user-" + UUID.randomUUID().toString().substring(0, 8);
                orderService.createOrder(request, fakeUserId);
            }
            log.info("Successfully seeded 10 orders.");

        } catch (Exception e) {
            log.error("Failed to seed orders: {}", e.getMessage());
        }
    }
}