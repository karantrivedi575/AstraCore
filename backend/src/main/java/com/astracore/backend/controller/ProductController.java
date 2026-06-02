package com.astracore.backend.controller;

import com.astracore.backend.model.Product;
import com.astracore.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {

    private final ProductRepository productRepository;

   
    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    
   
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "8") @Min(1) @Max(1000) int size) {

        Pageable paging = PageRequest.of(page, size);
        Page<Product> pageProducts = productRepository.findAll(paging);

        Map<String, Object> response = new HashMap<>();
        response.put("products", pageProducts.getContent()); 
        response.put("currentPage", pageProducts.getNumber()); 
        response.put("totalItems", pageProducts.getTotalElements()); 
        response.put("totalPages", pageProducts.getTotalPages()); 

        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrendingProducts() {
        return ResponseEntity.ok(productRepository.findByIsTrendingTrue());
    }

    
    @GetMapping("/category/{slug}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String slug) {
        List<Product> products = productRepository.findByCategorySlugIgnoreCase(slug);
        return ResponseEntity.ok(products);
    }

  
    @GetMapping("/details/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        return productRepository.findBySlugIgnoreCase(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}