package com.final_project.chatting_service.service;

import com.final_project.chatting_service.dto.MessageRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MessageService {

    private final RestTemplate restTemplate;

    public MessageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void saveMessage(MessageRequestDTO messageRequestDTO) throws Exception {
        try {
            restTemplate.postForObject(
                    "http://localhost:7000/api/save-message",
                    messageRequestDTO,
                    Void.class
            );
        } catch (Exception e) {
            System.out.print("failure" +e.getMessage());
            throw new IllegalStateException("Message addition failed");
        }
    }
}


