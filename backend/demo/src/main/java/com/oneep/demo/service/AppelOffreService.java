package com.oneep.demo.service;

import com.oneep.demo.model.AppelOffre;
import com.oneep.demo.model.User;
import com.oneep.demo.repository.AppelOffreRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppelOffreService {

    private final AppelOffreRepository repository;

    
    public AppelOffreService(AppelOffreRepository repository) {
        this.repository = repository;
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

    // ✅ USER uniquement
    public void postuler(Long id, User user) {
        AppelOffre ao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appel d'offre non trouvé"));

        // ⚠️ ICI tu pourras ajouter la logique pour enregistrer la postulation en BDD
        System.out.println("✅ Fournisseur " + user.getEmail() + " a postulé à l’appel d’offre " + id);
    }
}
