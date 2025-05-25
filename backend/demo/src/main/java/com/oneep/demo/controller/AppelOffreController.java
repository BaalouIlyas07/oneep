package com.oneep.demo.controller;

import com.oneep.demo.model.AppelOffre;
import com.oneep.demo.model.User;
import com.oneep.demo.service.AppelOffreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appels-offres")
@CrossOrigin(origins = "http://localhost:3000") // Ajustez selon votre URL frontend
public class AppelOffreController {

    private final AppelOffreService appelOffreService;

    public AppelOffreController(AppelOffreService appelOffreService) {
        this.appelOffreService = appelOffreService;
    }

    // ✅ Accessible à tous (même non connectés)
    @GetMapping
    public ResponseEntity<List<AppelOffre>> getAllAppelsOffres() {
        List<AppelOffre> appelsOffres = appelOffreService.getAllAppelsOffres();
        return ResponseEntity.ok(appelsOffres);
    }

    // ✅ ADMIN uniquement
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppelOffre> createAppelOffre(@RequestBody AppelOffre appelOffre) {
        try {
            AppelOffre created = appelOffreService.createAppelOffre(appelOffre);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ ADMIN uniquement
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppelOffre> updateAppelOffre(@PathVariable Long id, @RequestBody AppelOffre appelOffre) {
        try {
            AppelOffre updated = appelOffreService.updateAppelOffre(id, appelOffre);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ ADMIN uniquement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppelOffre(@PathVariable Long id) {
        try {
            appelOffreService.deleteAppelOffre(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ USER uniquement - Postuler à un appel d'offre
    @PostMapping("/{id}/postuler")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> postuler(@PathVariable Long id, Authentication authentication) {
        try {
            // Récupérer l'utilisateur connecté depuis le contexte de sécurité
            User currentUser = (User) authentication.getPrincipal();
            appelOffreService.postuler(id, currentUser);
            return ResponseEntity.ok("Candidature enregistrée avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la postulation");
        }
    }

    // ✅ Optionnel : Récupérer un appel d'offre par ID
    @GetMapping("/{id}")
    public ResponseEntity<AppelOffre> getAppelOffreById(@PathVariable Long id) {
        try {
            // Vous devrez ajouter cette méthode dans votre service
            // AppelOffre appelOffre = appelOffreService.getById(id);
            // return ResponseEntity.ok(appelOffre);
            return ResponseEntity.notFound().build(); // Temporaire
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}