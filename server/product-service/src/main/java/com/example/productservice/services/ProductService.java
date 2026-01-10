package com.example.productservice.services;

import com.example.productservice.entities.Product;
import com.example.productservice.repositories.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    // Add a product
    public Product create(Product product) {
        return productRepository.save(product);
    }

    // Edit a product
    @Transactional
    public Product update(String id, Product product) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    existingProduct.setName(product.getName());
                    existingProduct.setDescription(product.getDescription());
                    existingProduct.setPrice(product.getPrice());
                    existingProduct.setQuantity(product.getQuantity());
                    return productRepository.save(existingProduct);
                })
                .orElseThrow(() -> new RuntimeException("Product with id " + id + " does not exist"));
    }

    // List all products
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    // Details of product using id
    public Product getById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // Delete product using id
    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete: Product with id " + id + " does not exist");
        }
        productRepository.deleteById(id);
    }
}
