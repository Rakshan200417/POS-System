package com.possystem.backend.config;

import com.possystem.backend.model.Role;
import com.possystem.backend.model.User;
import com.possystem.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create or update default admin user
        seedUser("admin", "admin@pos.com", "admin123", Role.ROLE_ADMIN);
        
        // Create or update default cashier user
        seedUser("cashier", "cashier@pos.com", "cashier123", Role.ROLE_CASHIER);
    }

    private void seedUser(String username, String email, String password, Role role) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        
        if (existingUser.isPresent()) {
            // Update password and roles if user already exists
            User user = existingUser.get();
            user.setPassword(passwordEncoder.encode(password));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
        } else {
            // Create new user if it doesn't exist
            User user = new User(username, email, passwordEncoder.encode(password));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
        }
    }
}
