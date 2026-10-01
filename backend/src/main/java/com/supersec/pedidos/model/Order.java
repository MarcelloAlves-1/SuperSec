package com.supersec.pedidos.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.*;
import java.time.*;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity @Table(name="orders") @Getter @Setter @NoArgsConstructor
public class Order {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @JsonIgnore
 @ManyToOne(optional=false) private User user;
 @Column(nullable=false, precision=10, scale=2) private BigDecimal total;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status=OrderStatus.PENDING;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true) private List<OrderItem> items=new ArrayList<>();
}
