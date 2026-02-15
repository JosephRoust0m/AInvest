package com.final_project.chatting_service.controller;

import com.final_project.chatting_service.dto.MessageRequestDTO;
import com.final_project.chatting_service.handler.ChatSocketHandler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    @Mock
    private ChatSocketHandler handler;

    @InjectMocks
    private MessageController controller;

    @Test
    void testSendMessage() throws Exception {
        // Arrange
        MessageRequestDTO dto = new MessageRequestDTO();
        dto.setReceiver("+1234567890");
        dto.setText("Hello World");

        // Act
        String response = controller.send(dto);

        // Assert
        // Capture the JSON sent to the handler
        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);

        verify(handler, times(1))
                .sendToUser(eq("+1234567890"), jsonCaptor.capture());

        // Validate JSON content
        String jsonSent = jsonCaptor.getValue();
        assertTrue(jsonSent.contains("Hello World"));
        assertTrue(jsonSent.contains("+1234567890"));

        assertEquals("Failed to mend message", response);
    }
}

