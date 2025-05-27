package com.oneep.demo.controller;

import com.oneep.demo.model.Postulation;
import com.oneep.demo.model.StatutPostulation;
import com.oneep.demo.repository.PostulationRepository;
import com.oneep.demo.service.UserService;
import com.oneep.demo.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

 private final UserService userService;
 private final PostulationRepository postulationRepository;

 public AdminController(UserService userService, PostulationRepository postulationRepository) {
    this.userService = userService;
     this.postulationRepository = postulationRepository;
}

@GetMapping("/users")
 public ResponseEntity<List<User>> getAllUsers() {
     return ResponseEntity.ok(userService.findAllUsers());
}

@DeleteMapping("/users/{id}")
 public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok().build();
}

@PutMapping("/users/{id}/status")
public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
    userService.updateUserStatus(id, active);
    return ResponseEntity.ok().build();
}

@GetMapping("/postulations")
public ResponseEntity<List<Postulation>> getAllPostulations() {
    return ResponseEntity.ok(postulationRepository.findAll());
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
