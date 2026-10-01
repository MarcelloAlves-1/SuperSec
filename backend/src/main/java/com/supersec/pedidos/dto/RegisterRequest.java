package com.supersec.pedidos.dto; import jakarta.validation.constraints.*;
public record RegisterRequest(@NotBlank String name,@Email @NotBlank String email,@Size(min=6) String password){}
