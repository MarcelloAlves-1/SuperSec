package com.supersec.pedidos.controller;

import com.supersec.pedidos.dto.ProductRequest;
import com.supersec.pedidos.model.Product;
import com.supersec.pedidos.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository r;
    public ProductController(ProductRepository r){this.r=r;}

    @GetMapping("/public")
    public List<Product> publicProducts(){return r.findByActiveTrue();}

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Product> all(){return r.findAll();}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@Valid @RequestBody ProductRequest x){
        var p=new Product();
        apply(p,x);
        p.setActive(true);
        return r.save(p);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id,@Valid @RequestBody ProductRequest x){
        var p=r.findById(id).orElseThrow(()->new IllegalArgumentException("Produto não encontrado"));
        apply(p,x);
        return r.save(p);
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public Product activate(@PathVariable Long id){
        var p=r.findById(id).orElseThrow(()->new IllegalArgumentException("Produto não encontrado"));
        p.setActive(true);
        return r.save(p);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id){
        var p=r.findById(id).orElseThrow(()->new IllegalArgumentException("Produto não encontrado"));
        p.setActive(false);
        r.save(p);
    }

    private void apply(Product p, ProductRequest x){
        p.setName(x.name().trim());
        p.setDescription(x.description() == null ? "" : x.description().trim());
        p.setPrice(x.price());
        p.setStock(x.stock());
        p.setImageUrl(x.imageUrl() == null ? "" : x.imageUrl().trim());
    }
}
