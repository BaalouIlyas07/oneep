package com.oneep.demo.controller;

import com.oneep.demo.model.AppelOffre;
import com.oneep.demo.service.AppelOffreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appels-offres")
@CrossOrigin(origins = "http://localhost:3000")
public class AppelOffreController {

    private final AppelOffreService appelOffreService;

    public AppelOffreController(AppelOffreService appelOffreService) {
        this.appelOffreService = appelOffreService;
    }

    @GetMapping
    public ResponseEntity<List<AppelOffre>> getAllAppelsOffres() {
        List<AppelOffre> appelsOffres = appelOffreService.getAllAppelsOffres();
        return ResponseEntity.ok(appelsOffres);
    }

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

    // 🔥 CORRECTION PRINCIPALE : Méthode postuler corrigée
    @PostMapping("/{id}/postuler")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> postuler(@PathVariable Long id, Authentication authentication) {
        try {
            // 🔧 CORRECTION 1: Récupérer l'email depuis le token JWT
            String userEmail = null;
            
            // Méthode 1: Si votre JWT contient directement l'email
            userEmail = authentication.getName();
            
            // Méthode 2: Si vous avez un objet User personnalisé dans le principal
            // User currentUser = (User) authentication.getPrincipal();
            // userEmail = currentUser.getEmail();
            
            // Méthode 3: Si vous utilisez UserDetails
            // UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // userEmail = userDetails.getUsername(); // Si username = email
            
            System.out.println("🔍 Debug - Email récupéré: " + userEmail);
            System.out.println("🔍 Debug - ID Appel d'offre: " + id);
            System.out.println("🔍 Debug - Type principal: " + authentication.getPrincipal().getClass());
            
            // 🔧 CORRECTION 2: Appeler la bonne méthode du service
            appelOffreService.postulerByEmail(id, userEmail);
            
            return ResponseEntity.ok("Candidature enregistrée avec succès");
            
        } catch (RuntimeException e) {
            System.err.println("❌ Erreur RuntimeException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Erreur générale: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de la postulation: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppelOffre> getAppelOffreById(@PathVariable Long id) {
        try {
            // Vous devrez ajouter cette méthode dans votre service si nécessaire
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Ajoutez cette méthode dans votre AppelOffreController

    @GetMapping("/{id}/has-applied")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> hasUserApplied(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            boolean hasApplied = appelOffreService.hasUserApplied(id, userEmail);
            return ResponseEntity.ok(hasApplied);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
  
}