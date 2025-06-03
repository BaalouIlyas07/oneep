package com.oneep.demo.dto;

import com.oneep.demo.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDto {
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Veuillez fournir un email valide")
    private String email;

    private String firstName;
    private String lastName;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    private String phoneNumber;
    private String cin;
    private String address;
    private Role role;
}