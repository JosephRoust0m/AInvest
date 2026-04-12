package com.final_project.chatting_service.service;

import com.final_project.chatting_service.dto.MessageRequestDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private MessageService messageService;

    @Test
    void saveMessage_ShouldCallRestTemplate() throws Exception {
        // Arrange
        MessageRequestDTO dto = new MessageRequestDTO();

        // Act
        messageService.saveMessage(dto);

        // Assert
        verify(restTemplate, times(1)).postForObject(
                eq("scintillating-caring-production-2d86.up.railway.app"),
                eq(dto),
                eq(Void.class)
        );
    }

    @Test
    void saveMessage_WhenRestTemplateThrows_ShouldThrowIllegalStateException() {
        // Arrange
        MessageRequestDTO dto = new MessageRequestDTO();

        when(restTemplate.postForObject(anyString(), any(), any()))
                .thenThrow(new RuntimeException("boom"));

        // Act + Assert
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> messageService.saveMessage(dto)
        );

        assertEquals("Message addition failed", ex.getMessage());
    }
}
