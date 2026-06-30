package com.astracore.backend.repository;

import com.astracore.backend.model.Product;
import com.astracore.backend.model.Review;
import com.astracore.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
    boolean existsByUserAndProduct(User user, Product product);
}