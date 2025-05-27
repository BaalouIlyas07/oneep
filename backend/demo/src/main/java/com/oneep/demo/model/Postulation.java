package com.oneep.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "postulation")
public class Postulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appel_offre_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AppelOffre appelOffre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @Column(name = "email_user", nullable = false)
    private String emailUser;

    @Column(name = "date_postulation", nullable = false)
    private LocalDateTime datePostulation;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutPostulation statut = StatutPostulation.EN_ATTENTE;

    // Constructeurs
    public Postulation() {
        this.datePostulation = LocalDateTime.now();
    }

    public Postulation(AppelOffre appelOffre, User user, String emailUser) {
        this();
        this.appelOffre = appelOffre;
        this.user = user;
        this.emailUser = emailUser;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AppelOffre getAppelOffre() {
        return appelOffre;
    }

    public void setAppelOffre(AppelOffre appelOffre) {
        this.appelOffre = appelOffre;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getEmailUser() {
        return emailUser;
    }

    public void setEmailUser(String emailUser) {
        this.emailUser = emailUser;
    }

    public LocalDateTime getDatePostulation() {
        return datePostulation;
    }

    public void setDatePostulation(LocalDateTime datePostulation) {
        this.datePostulation = datePostulation;
    }

    public StatutPostulation getStatut() {
        return statut;
    }

    public void setStatut(StatutPostulation statut) {
        this.statut = statut;
    }
}