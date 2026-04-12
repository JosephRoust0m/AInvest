package com.final_project.chatting_service.service;

import com.final_project.chatting_service.dto.MessageRequestDTO;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MessageService {

    private final RestTemplate restTemplate;

    public MessageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void saveMessage(MessageRequestDTO messageRequestDTO) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gateway-Secret", System.getenv("GATEWAY_SECRET"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<MessageRequestDTO> entity = new HttpEntity<>(messageRequestDTO, headers);
        try {
            restTemplate.postForObject(
                    "scintillating-caring-production-2d86.up.railway.app/api/save-message",
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            System.out.print("failure" +e.getMessage());
            throw new IllegalStateException("Message addition failed");
        }
    }
}


