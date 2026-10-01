package com.supersec.pedidos.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name="products") @Getter @Setter @NoArgsConstructor
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String name;
 @Column(length=500) private String description;
 @Column(nullable=false, precision=10, scale=2) private BigDecimal price;
 @Column(nullable=false) private Integer stock;
 private String imageUrl;
 private boolean active=true;
}
