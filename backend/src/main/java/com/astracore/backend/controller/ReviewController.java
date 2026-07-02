package com.astracore.backend.controller;

import com.astracore.backend.model.Product;
import com.astracore.backend.model.Review;
import com.astracore.backend.model.User;
import com.astracore.backend.repository.ProductRepository;
import com.astracore.backend.repository.ReviewRepository;
import com.astracore.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.astracore.backend.payload.ReviewDto;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Review> reviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);

        // Mapping to a simplified DTO response for the frontend
        List<Map<String, Object>> reviewData = reviews.stream().map(r -> Map.<String, Object>of(
                "id", r.getId(),
                "rating", r.getRating(),
                "comment", r.getComment(),
                "username", r.getUser().getUsername(),
                "date", r.getCreatedAt().toString()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(reviewData);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId, @Valid @RequestBody ReviewDto payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Prevent multiple reviews from the same user
        if (reviewRepository.existsByUserAndProduct(user, product)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You have already reviewed this product."));
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(payload.getRating());
        review.setComment(payload.getComment());

        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of("message", "Review added successfully!"));
    }
}