package com.oneep.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class AppelOffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String site;

    @Column(name = "numero_ao")
    private String numeroAO;

    private String titre;
    private String description;
    private Double montantEstimatif;

    private LocalDate dateLancement;
    private LocalDate dateLimite;

    // === Getters & Setters ===

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getNumeroAO() {
        return numeroAO;
    }

    public void setNumeroAO(String numeroAO) {
        this.numeroAO = numeroAO;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMontantEstimatif() {
        return montantEstimatif;
    }

    public void setMontantEstimatif(Double montantEstimatif) {
        this.montantEstimatif = montantEstimatif;
    }

    public LocalDate getDateLancement() {
        return dateLancement;
    }

    public void setDateLancement(LocalDate dateLancement) {
        this.dateLancement = dateLancement;
    }

    public LocalDate getDateLimite() {
        return dateLimite;
    }

    public void setDateLimite(LocalDate dateLimite) {
        this.dateLimite = dateLimite;
    }
}
