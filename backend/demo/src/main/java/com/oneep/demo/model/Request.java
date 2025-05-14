package com.oneep.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "requests")
@Data
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String status;

    @Column(name = "response")
    private String response;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}