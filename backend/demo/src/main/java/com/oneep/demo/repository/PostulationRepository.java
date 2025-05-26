package com.oneep.demo.repository;

import com.oneep.demo.model.Postulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulationRepository extends JpaRepository<Postulation, Long> {

    // Vérifier si un utilisateur a déjà postulé pour un appel d'offre
    @Query("SELECT p FROM Postulation p WHERE p.appelOffre.id = :appelOffreId AND p.emailUser = :email")
    Optional<Postulation> findByAppelOffreIdAndEmailUser(@Param("appelOffreId") Long appelOffreId, 
                                                         @Param("email") String email);

    // Récupérer toutes les postulations d'un utilisateur
    @Query("SELECT p FROM Postulation p WHERE p.emailUser = :email ORDER BY p.datePostulation DESC")
    List<Postulation> findAllByEmailUser(@Param("email") String email);

    // Récupérer toutes les postulations pour un appel d'offre
    @Query("SELECT p FROM Postulation p WHERE p.appelOffre.id = :appelOffreId ORDER BY p.datePostulation ASC")
    List<Postulation> findAllByAppelOffreId(@Param("appelOffreId") Long appelOffreId);

    // Compter le nombre de postulations pour un appel d'offre
    @Query("SELECT COUNT(p) FROM Postulation p WHERE p.appelOffre.id = :appelOffreId")
    Long countByAppelOffreId(@Param("appelOffreId") Long appelOffreId);

    // Vérifier l'existence d'une postulation
    boolean existsByAppelOffreIdAndEmailUser(Long appelOffreId, String emailUser);
}