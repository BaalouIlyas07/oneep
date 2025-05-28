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
    @NotBlank(message = "Le type de compte est obligatoire")
    private String accountType; // "INDIVIDUAL" or "COMPANY"

    // Fields for Individual
    private String cin;
    private String firstName;
    private String lastName;
    private String address;

    // Fields for Company
    private String companyName;
    private String businessName;
    private String tradeRegisterNumber;

    // Common fields
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Veuillez fournir un email valide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    private String phoneNumber;
    private Role role;
}