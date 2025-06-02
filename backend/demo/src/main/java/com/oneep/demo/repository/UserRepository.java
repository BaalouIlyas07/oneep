package com.oneep.demo.repository;

import com.oneep.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE users SET is_active = :active WHERE id = :id", nativeQuery = true)
    void updateUserStatus(@Param("id") Long id, @Param("active") boolean active);
}