package com.astracore.backend.repository;

import com.astracore.backend.model.Product;
import com.astracore.backend.model.User;
import com.astracore.backend.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserOrderByAddedAtDesc(User user);
    Optional<Wishlist> findByUserAndProduct(User user, Product product);
    boolean existsByUserAndProduct(User user, Product product);
}