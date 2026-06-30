package com.astracore.backend.repository;

import com.astracore.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);
    Optional<Product> findBySlugIgnoreCaseAndIsActiveTrue(String slug);
    List<Product> findByCategorySlugIgnoreCase(String slug);
    List<Product> findByIsTrendingTrue();
}