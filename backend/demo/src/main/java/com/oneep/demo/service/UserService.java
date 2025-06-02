package com.oneep.demo.service;

import com.oneep.demo.dto.UserRegistrationDto;
import com.oneep.demo.exeption.UserAlreadyExistsException;
import com.oneep.demo.model.Role;
import com.oneep.demo.model.User;
import com.oneep.demo.repository.UserRepository;
import com.oneep.demo.repository.PostulationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PostulationRepository postulationRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PostulationRepository postulationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.postulationRepository = postulationRepository;
    }

    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new UserAlreadyExistsException("Un utilisateur avec cet email existe déjà");
        }

        User user = new User();
        user.setAccountType(registrationDto.getAccountType());
        
        if ("INDIVIDUAL".equals(registrationDto.getAccountType())) {
            user.setCin(registrationDto.getCin());
            user.setFirstName(registrationDto.getFirstName());
            user.setLastName(registrationDto.getLastName());
            user.setAddress(registrationDto.getAddress());
        } else if ("COMPANY".equals(registrationDto.getAccountType())) {
            user.setCompanyName(registrationDto.getCompanyName());
            user.setBusinessName(registrationDto.getBusinessName());
            user.setTradeRegisterNumber(registrationDto.getTradeRegisterNumber());
        }

        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setPhoneNumber(registrationDto.getPhoneNumber());
        user.setRole(registrationDto.getRole() != null ? registrationDto.getRole() : Role.USER);

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
            .map(user -> {
                user.setFirstName(userDetails.getFirstName());
                user.setLastName(userDetails.getLastName());
                user.setEmail(userDetails.getEmail());
                user.setPhoneNumber(userDetails.getPhoneNumber());
                if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                    user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                }
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id " + id));
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        logger.info("Début de la suppression de l'utilisateur ID: {} et ses postulations", id);
        try {
            // Supprimer d'abord toutes les postulations de l'utilisateur
            postulationRepository.deleteByUserId(id);
            logger.info("Postulations supprimées pour l'utilisateur ID: {}", id);

            // Ensuite supprimer l'utilisateur
            userRepository.deleteById(id);
            logger.info("Utilisateur ID: {} supprimé avec succès", id);
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de l'utilisateur ID: {}. Erreur: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la suppression de l'utilisateur: " + e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public User updateUserStatus(Long id, boolean active) {
        logger.info("Début de la mise à jour du statut de l'utilisateur. ID: {}, Nouveau statut: {}", id, active);
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Utilisateur non trouvé avec l'ID: {}", id);
                    return new RuntimeException("Utilisateur non trouvé avec l'id " + id);
                });
            
            logger.info("Utilisateur trouvé: {} (Email: {})", user.getFirstName() + " " + user.getLastName(), user.getEmail());
            logger.info("Ancien statut actif: {}, Nouveau statut actif: {}", user.isActive(), active);
            
            userRepository.updateUserStatus(id, active);
            
            User updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Erreur lors du rechargement de l'utilisateur"));
            
            logger.info("Mise à jour réussie pour l'utilisateur ID: {}", updatedUser.getId());
            return updatedUser;
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du statut de l'utilisateur ID: {}. Erreur: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la mise à jour du statut de l'utilisateur: " + e.getMessage());
        }
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id " + id));
    }

    public User promoteToAdmin(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.ADMIN);
        return userRepository.save(user);
    }

    public User updateProfile(String email, User updatedUser) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        return userRepository.save(user);
    }
}