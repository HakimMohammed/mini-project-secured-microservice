package com.example.productservice.seeder;

import com.example.productservice.entities.Product;
import com.example.productservice.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

//@Configuration
@Slf4j
@AllArgsConstructor
public class ProductSeeder {

    private final ProductRepository productRepository;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (productRepository.count() == 0) {
                log.info("Database is empty. Seeding initial product data...");

                List<Product> products = List.of(
                        Product.builder().name("Laptop Pro").description("High-end workstation").price(1500.0).quantity(10).build(),
                        Product.builder().name("Wireless Mouse").description("Ergonomic 2.4GHz").price(25.0).quantity(50).build(),
                        Product.builder().name("Mechanical Keyboard").description("RGB Backlit Blue Switches").price(80.0).quantity(30).build(),
                        Product.builder().name("Monitor 4K").description("27-inch IPS Panel").price(400.0).quantity(15).build(),
                        Product.builder().name("USB-C Hub").description("7-in-1 Multiport Adapter").price(45.0).quantity(100).build(),
                        Product.builder().name("Webcam HD").description("1080p with Microphone").price(60.0).quantity(25).build(),
                        Product.builder().name("Gaming Headset").description("7.1 Surround Sound").price(90.0).quantity(20).build(),
                        Product.builder().name("External SSD").description("1TB NVMe Portable").price(120.0).quantity(40).build(),
                        Product.builder().name("Smartphone Stand").description("Adjustable Aluminum Holder").price(15.0).quantity(200).build(),
                        Product.builder().name("Desk Mat").description("Large Waterproof Leather").price(20.0).quantity(60).build()
                );

                productRepository.saveAll(products);
                log.info("Successfully seeded 10 products.");
            } else {
                log.info("Database already contains data. Skipping seeding.");
            }
        };
    }
}
