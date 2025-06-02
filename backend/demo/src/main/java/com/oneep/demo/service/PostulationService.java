package com.oneep.demo.service;

import com.oneep.demo.dto.PostulationDTO;
import com.oneep.demo.model.Postulation;
import com.oneep.demo.repository.PostulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostulationService {

    private final PostulationRepository postulationRepository;

    @Autowired
    public PostulationService(PostulationRepository postulationRepository) {
        this.postulationRepository = postulationRepository;
    }

    @Transactional(readOnly = true)
    public List<PostulationDTO> getAllPostulations() {
        List<Postulation> postulations = postulationRepository.findAllWithRelations();
        return postulations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PostulationDTO convertToDTO(Postulation postulation) {
        PostulationDTO dto = new PostulationDTO();
        dto.setId(postulation.getId());
        
        if (postulation.getAppelOffre() != null) {
            dto.setAppelOffreId(postulation.getAppelOffre().getId());
            dto.setAppelOffreTitre(postulation.getAppelOffre().getTitre());
            dto.setAppelOffreNumeroAO(postulation.getAppelOffre().getNumeroAO());
            dto.setAppelOffreSite(postulation.getAppelOffre().getSite());
        } else {
            dto.setAppelOffreTitre("Appel d'offre non disponible");
            dto.setAppelOffreNumeroAO("-");
            dto.setAppelOffreSite("-");
        }

        if (postulation.getUser() != null) {
            dto.setUserEmail(postulation.getUser().getEmail());
            dto.setUserName(postulation.getUser().getFirstName() + " " + postulation.getUser().getLastName());
        } else {
            dto.setUserEmail(postulation.getEmailUser());
            dto.setUserName("Utilisateur non disponible");
        }

        dto.setDatePostulation(postulation.getDatePostulation());
        dto.setStatut(postulation.getStatut() != null ? postulation.getStatut().toString() : "EN_ATTENTE");
        return dto;
    }
} 