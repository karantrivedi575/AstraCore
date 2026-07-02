package com.astracore.backend.controller;

import com.astracore.backend.model.Product;
import com.astracore.backend.model.User;
import com.astracore.backend.model.Wishlist;
import com.astracore.backend.repository.ProductRepository;
import com.astracore.backend.repository.UserRepository;
import com.astracore.backend.repository.WishlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistController(WishlistRepository wishlistRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getMyWishlist() {
        User user = getAuthenticatedUser();
        List<Product> wishlistProducts = wishlistRepository.findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());
        return ResponseEntity.ok(wishlistProducts);
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long productId) {
        try {
            User user = getAuthenticatedUser();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Optional<Wishlist> existingItemOpt = wishlistRepository.findByUserAndProduct(user, product);

            if (existingItemOpt.isPresent()) {
                // Item exists, so remove it
                wishlistRepository.delete(existingItemOpt.get());
                return ResponseEntity.ok(Map.of("message", "Removed from wishlist", "isLiked", false));
            } else {
                // Item doesn't exist, so add it
                Wishlist newItem = new Wishlist();
                newItem.setUser(user);
                newItem.setProduct(product);
                wishlistRepository.save(newItem);
                return ResponseEntity.ok(Map.of("message", "Added to wishlist", "isLiked", true));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update wishlist. Please try again."));
        }
    }
}