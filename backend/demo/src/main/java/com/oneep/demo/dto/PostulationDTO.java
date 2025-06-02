package com.oneep.demo.dto;

import java.time.LocalDateTime;

public class PostulationDTO {
    private Long id;
    private Long appelOffreId;
    private String appelOffreTitre;
    private String appelOffreNumeroAO;
    private String appelOffreSite;
    private String userEmail;
    private String userName;
    private LocalDateTime datePostulation;
    private String statut;

    // Constructeur
    public PostulationDTO() {}

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppelOffreId() {
        return appelOffreId;
    }

    public void setAppelOffreId(Long appelOffreId) {
        this.appelOffreId = appelOffreId;
    }

    public String getAppelOffreTitre() {
        return appelOffreTitre;
    }

    public void setAppelOffreTitre(String appelOffreTitre) {
        this.appelOffreTitre = appelOffreTitre;
    }

    public String getAppelOffreNumeroAO() {
        return appelOffreNumeroAO;
    }

    public void setAppelOffreNumeroAO(String appelOffreNumeroAO) {
        this.appelOffreNumeroAO = appelOffreNumeroAO;
    }

    public String getAppelOffreSite() {
        return appelOffreSite;
    }

    public void setAppelOffreSite(String appelOffreSite) {
        this.appelOffreSite = appelOffreSite;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDateTime getDatePostulation() {
        return datePostulation;
    }

    public void setDatePostulation(LocalDateTime datePostulation) {
        this.datePostulation = datePostulation;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
} 