package com.supersec.pedidos.repository;
import com.supersec.pedidos.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface OrderRepository extends JpaRepository<Order,Long>{ List<Order> findByUserIdOrderByCreatedAtDesc(Long userId); }
