package com.final_project.chatting_service.handler;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatSocketHandlerTest {

    private ChatSocketHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ChatSocketHandler();
    }

    @Test
    void testAfterConnectionEstablishedStoresSessionByUsername() throws Exception {
        // Arrange
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getUri()).thenReturn(new URI("ws://localhost:8080/ws?username=joseph"));

        // Act
        handler.afterConnectionEstablished(session);
        when(session.isOpen()).thenReturn(true);

        // Assert
        handler.sendToUser("joseph", "hello"); // should not throw
        verify(session, times(1)).sendMessage(any(TextMessage.class));
    }

    @Test
    void testSendToUserSendsMessageWhenUserIsConnected() throws Exception {
        // Arrange
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getUri()).thenReturn(new URI("ws://localhost:8080/ws?username=joseph"));
        when(session.isOpen()).thenReturn(true);

        handler.afterConnectionEstablished(session);

        // Act
        handler.sendToUser("joseph", "{\"text\":\"hello\"}");

        // Assert
        ArgumentCaptor<TextMessage> captor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session).sendMessage(captor.capture());
        assertEquals("{\"text\":\"hello\"}", captor.getValue().getPayload());
    }

    @Test
    void testSendToUserDoesNothingWhenUserIsOffline() throws Exception {
        // Arrange
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getUri()).thenReturn(new URI("ws://localhost:8080/ws?username=joseph"));
        when(session.isOpen()).thenReturn(false);

        handler.afterConnectionEstablished(session);

        // Act
        handler.sendToUser("joseph", "ignored");

        // Assert
        verify(session, never()).sendMessage(any());
    }

    @Test
    void testSendToUserDoesNothingWhenUserNotConnected() throws Exception {
        // Act
        handler.sendToUser("ghost", "hello");

        // Assert
        // No exception should be thrown
    }
}
