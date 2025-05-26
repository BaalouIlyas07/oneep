package com.oneep.demo.service;

import com.oneep.demo.model.AppelOffre;
import com.oneep.demo.model.Postulation;
import com.oneep.demo.model.User;
import com.oneep.demo.repository.AppelOffreRepository;
import com.oneep.demo.repository.PostulationRepository;
import com.oneep.demo.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppelOffreService {

    private final AppelOffreRepository repository;
    private final PostulationRepository postulationRepository;
    private final UserRepository userRepository;

    public AppelOffreService(AppelOffreRepository repository, 
                           PostulationRepository postulationRepository,
                           UserRepository userRepository) {
        this.repository = repository;
        this.postulationRepository = postulationRepository;
        this.userRepository = userRepository;
    }

    // ✅ Méthode publique : accessible à tous
    public List<AppelOffre> getAllAppelsOffres() {
        return repository.findAll();
    }

    // ✅ ADMIN uniquement
    public AppelOffre createAppelOffre(AppelOffre appelOffre) {
        return repository.save(appelOffre);
    }

    // ✅ ADMIN uniquement
    public void deleteAppelOffre(Long id) {
        repository.deleteById(id);
    }

    // ✅ ADMIN uniquement
    public AppelOffre updateAppelOffre(Long id, AppelOffre updated) {
        AppelOffre existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offre introuvable"));
        existing.setTitre(updated.getTitre());
        existing.setDescription(updated.getDescription());
        existing.setDateLimite(updated.getDateLimite());
        existing.setMontantEstimatif(updated.getMontantEstimatif());
        existing.setDateLancement(updated.getDateLancement());
        existing.setSite(updated.getSite());
        return repository.save(existing);
    }

    // ✅ USER uniquement - Version mise à jour qui SAUVEGARDE en BDD
    @Transactional
    public void postulerByEmail(Long id, String userEmail) {
        // Récupérer l'appel d'offre
        AppelOffre ao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offre non trouvé"));

        // Vérifier si la date limite n'est pas dépassée
        if (ao.getDateLimite() != null && ao.getDateLimite().isBefore(LocalDate.now())) {
            throw new RuntimeException("La date limite de cet appel d'offre est dépassée");
        }

        // Vérifier si l'utilisateur n'a pas déjà postulé
        if (postulationRepository.existsByAppelOffreIdAndEmailUser(id, userEmail)) {
            throw new RuntimeException("Vous avez déjà postulé pour cet appel d'offre");
        }

        // Récupérer l'utilisateur (optionnel selon votre modèle)
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // ✅ CRÉER ET SAUVEGARDER LA POSTULATION EN BASE DE DONNÉES
        Postulation postulation = new Postulation(ao, user, userEmail);
        postulationRepository.save(postulation);

        System.out.println("✅ Postulation sauvegardée : Fournisseur " + userEmail + 
                          " a postulé à l'appel d'offre " + id + " (ID postulation: " + postulation.getId() + ")");
    }

    // ✅ Nouvelle méthode pour récupérer les postulations d'un utilisateur
    public List<Postulation> getPostulationsByUser(String userEmail) {
        return postulationRepository.findAllByEmailUser(userEmail);
    }

    // ✅ Nouvelle méthode pour récupérer les postulations d'un appel d'offre (ADMIN)
    public List<Postulation> getPostulationsByAppelOffre(Long appelOffreId) {
        return postulationRepository.findAllByAppelOffreId(appelOffreId);
    }

    // ✅ Vérifier si un utilisateur a déjà postulé
    public boolean aDejaPostule(Long appelOffreId, String userEmail) {
        return postulationRepository.existsByAppelOffreIdAndEmailUser(appelOffreId, userEmail);
    }
    // Ajoutez cette méthode dans votre AppelOffreService

    public boolean hasUserApplied(Long appelOffreId, String userEmail) {
    return postulationRepository.existsByAppelOffreIdAndEmailUser(appelOffreId, userEmail);
}
}