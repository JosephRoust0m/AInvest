package com.final_project.chatting_service.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GatewaySecretFilter implements Filter {

    String gatewaySecret = System.getenv("GATEWAY_SECRET");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        if (path.startsWith("/api/")) {
            String incomingSecret = httpRequest.getHeader("X-Gateway-Secret");
            if (incomingSecret == null || !incomingSecret.equals(gatewaySecret)) {
                httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"error\":\"Access denied: requests must originate from the API gateway\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
