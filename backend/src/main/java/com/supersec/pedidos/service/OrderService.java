package com.supersec.pedidos.service;

import com.supersec.pedidos.dto.OrderRequest;
import com.supersec.pedidos.model.*;
import com.supersec.pedidos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {
    private static final BigDecimal SHIPPING = new BigDecimal("12.90");
    private static final BigDecimal FREE_SHIPPING_FROM = new BigDecimal("150.00");
    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;

    public OrderService(OrderRepository o,ProductRepository p,UserRepository u){orders=o;products=p;users=u;}

    @Transactional
    public Order create(String email,OrderRequest req){
        if(req.items() == null || req.items().isEmpty()) throw new IllegalArgumentException("O carrinho não pode estar vazio");
        var user=users.findByEmail(email).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));
        var order=new Order();
        order.setUser(user);
        BigDecimal subtotal=BigDecimal.ZERO;
        Set<Long> requested = new HashSet<>();
        for(var i:req.items()){
            if(!requested.add(i.productId())) throw new IllegalArgumentException("O mesmo produto foi informado mais de uma vez");
            var p=products.findById(i.productId()).orElseThrow(()->new IllegalArgumentException("Produto não encontrado"));
            if(!p.isActive()) throw new IllegalArgumentException("Produto indisponível: "+p.getName());
            if(i.quantity() <= 0 || p.getStock() < i.quantity()) throw new IllegalArgumentException("Estoque insuficiente: "+p.getName());
            p.setStock(p.getStock()-i.quantity());
            var item=new OrderItem();
            item.setOrder(order);
            item.setProduct(p);
            item.setQuantity(i.quantity());
            item.setUnitPrice(p.getPrice());
            order.getItems().add(item);
            subtotal=subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(i.quantity())));
        }
        var shipping = subtotal.compareTo(FREE_SHIPPING_FROM) >= 0 ? BigDecimal.ZERO : SHIPPING;
        order.setTotal(subtotal.add(shipping));
        return orders.save(order);
    }

    public List<Order> mine(String email){
        return users.findByEmail(email).map(u->orders.findByUserIdOrderByCreatedAtDesc(u.getId())).orElseThrow(()->new IllegalArgumentException("Usuário não encontrado"));
    }
}
