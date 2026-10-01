package com.supersec.pedidos.service;

import com.supersec.pedidos.dto.*;
import com.supersec.pedidos.model.*;
import com.supersec.pedidos.repository.UserRepository;
import com.supersec.pedidos.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository r,PasswordEncoder e,JwtService j){repo=r;encoder=e;jwt=j;}

    public AuthResponse register(RegisterRequest x){
        String email=x.email().trim().toLowerCase();
        if(repo.existsByEmail(email)) throw new IllegalArgumentException("E-mail já cadastrado");
        var u=new User(x.name().trim(),email,encoder.encode(x.password()),Role.USER);
        repo.save(u);
        return new AuthResponse(jwt.generate(u.getEmail(),u.getRole().name()),u.getName(),u.getRole().name());
    }

    public AuthResponse login(LoginRequest x){
        String email=x.email().trim().toLowerCase();
        var u=repo.findByEmail(email).orElseThrow(()->new IllegalArgumentException("Credenciais inválidas"));
        if(!encoder.matches(x.password(),u.getPassword())) throw new IllegalArgumentException("Credenciais inválidas");
        return new AuthResponse(jwt.generate(u.getEmail(),u.getRole().name()),u.getName(),u.getRole().name());
    }
}
