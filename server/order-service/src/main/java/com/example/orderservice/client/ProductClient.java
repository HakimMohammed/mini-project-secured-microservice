package com.example.orderservice.client;

import com.example.orderservice.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "product-service",
        url = "${application.config.product-service-url}",
        configuration = FeignConfig.class
)
public interface ProductClient {

    @GetMapping
    List<ProductDTO> getAll();

    @GetMapping("/{id}")
    ProductDTO getProductById(@PathVariable("id") String id);
}