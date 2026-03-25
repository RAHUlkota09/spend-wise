package com.expensetracker.controller;

import com.expensetracker.config.JwtUtil;
import com.expensetracker.dto.AuthDTO;
import com.expensetracker.model.User;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        if (userService.emailExists(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User saved = userService.registerUser(user);
        UserDetails userDetails = userService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthDTO.AuthResponse(token, saved.getUserId(), saved.getName(), saved.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthDTO.AuthResponse(token, user.getUserId(), user.getName(), user.getEmail()));
    }
}
