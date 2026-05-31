package com.astracore.backend.repository;

import com.astracore.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // JpaRepository gives you save(), findAll(), delete(), etc. for free!
}