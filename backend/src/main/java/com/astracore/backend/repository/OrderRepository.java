package com.astracore.backend.repository;

import com.astracore.backend.model.Order;
import com.astracore.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByIdDesc(User user);
}