package com.oneep.demo.controller;

import com.oneep.demo.model.Postulation;
import com.oneep.demo.model.StatutPostulation;
import com.oneep.demo.repository.PostulationRepository;
import com.oneep.demo.service.UserService;
import com.oneep.demo.model.User;
import com.oneep.demo.dto.ErrorResponse;
import com.oneep.demo.dto.PostulationDTO;
import com.oneep.demo.service.PostulationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;
    private final PostulationRepository postulationRepository;
    private final PostulationService postulationService;

    public AdminController(UserService userService, PostulationRepository postulationRepository, PostulationService postulationService) {
        this.userService = userService;
        this.postulationRepository = postulationRepository;
        this.postulationService = postulationService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/users/{id}/has-postulations")
    public ResponseEntity<Boolean> checkUserPostulations(@PathVariable Long id) {
        logger.info("Vérification des postulations pour l'utilisateur ID: {}", id);
        boolean hasPostulations = postulationRepository.existsByUserId(id);
        return ResponseEntity.ok(hasPostulations);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("Tentative de suppression de l'utilisateur ID: {}", id);
        try {
            userService.deleteUser(id);
            logger.info("Utilisateur ID: {} supprimé avec succès", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de l'utilisateur ID: {}. Erreur: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Erreur lors de la suppression de l'utilisateur: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        logger.info("Requête reçue pour mettre à jour le statut de l'utilisateur. ID: {}, Nouveau statut: {}", id, active);
        try {
            User updatedUser = userService.updateUserStatus(id, active);
            logger.info("Mise à jour réussie pour l'utilisateur ID: {}", id);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            logger.error("Erreur lors de la mise à jour du statut de l'utilisateur ID: {}. Erreur: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/postulations")
    public ResponseEntity<?> getPostulations() {
        try {
            List<PostulationDTO> postulations = postulationService.getAllPostulations();
            return ResponseEntity.ok(postulations);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des postulations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des postulations: " + e.getMessage());
        }
    }

    @PutMapping("/postulations/{id}/statut")
    public ResponseEntity<?> updatePostulationStatus(
        @PathVariable Long id,
         @RequestParam StatutPostulation statut) {
        return postulationRepository.findById(id)
        .map(p -> {
            p.setStatut(statut);
            postulationRepository.save(p);
            return ResponseEntity.ok().build();
        })
        .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/postulations/{id}")
    public ResponseEntity<?> deletePostulation(@PathVariable Long id) {
         postulationRepository.deleteById(id);
        return ResponseEntity.ok().build();
     }
}
