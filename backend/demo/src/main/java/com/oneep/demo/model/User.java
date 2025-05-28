package com.oneep.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le type de compte est obligatoire")
    @Column(name = "account_type")
    private String accountType;

    // Fields for Individual
    @Column(name = "cin")
    private String cin;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "address")
    private String address;

    // Fields for Company
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "trade_register_number")
    private String tradeRegisterNumber;

    // Common fields
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Veuillez fournir un email valide")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "is_active")
    private boolean active = true;
}