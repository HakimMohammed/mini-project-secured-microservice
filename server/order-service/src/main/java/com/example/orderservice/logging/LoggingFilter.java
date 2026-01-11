package com.example.orderservice.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        try {
            // Extract User ID from Security Context (Keycloak JWT)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = "anonymous";
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                // Prefer 'sub' (Subject) or 'preferred_username'
                userId = jwt.getClaimAsString("preferred_username");
                if (userId == null) {
                    userId = jwt.getSubject();
                }
            }
            
            // Put userId into MDC for all logs in this request
            MDC.put("userId", userId);
            
            // Process the request
            filterChain.doFilter(request, response);
            
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            String userId = MDC.get("userId");
            
            // Log the access event
            logger.info("ACCESS_LOG | User: {} | Method: {} | URI: {} | Status: {} | Duration: {}ms", 
                    userId, method, uri, status, duration);
            
            // Clean up MDC
            MDC.remove("userId");
        }
    }
}
