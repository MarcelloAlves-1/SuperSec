package com.supersec.pedidos.repository;

import com.supersec.pedidos.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    Optional<Product> findByName(String name);
}
