package com.supersec.pedidos.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity @Table(name="order_items") @Getter @Setter @NoArgsConstructor
public class OrderItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @JsonIgnore
 @ManyToOne(optional=false) private Order order;
 @ManyToOne(optional=false) private Product product;
 @Column(nullable=false) private Integer quantity;
 @Column(nullable=false, precision=10, scale=2) private BigDecimal unitPrice;
}
