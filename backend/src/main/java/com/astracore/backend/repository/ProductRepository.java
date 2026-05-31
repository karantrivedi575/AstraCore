package com.astracore.backend.repository;

import com.astracore.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    
    List<Product> findByCategoryId(Long categoryId);

  
    List<Product> findByIsTrendingTrue();

    
    List<Product> findByCategorySlugIgnoreCase(String slug);

    Optional<Product> findBySlugIgnoreCase(String slug);
}