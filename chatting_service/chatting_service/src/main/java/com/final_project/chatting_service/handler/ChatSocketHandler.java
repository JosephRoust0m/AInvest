package com.final_project.chatting_service.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = session.getUri().getQuery().split("=")[1];
        sessions.put(username, session);
    }

    public boolean sendToUser(String username, String json) throws Exception {
        WebSocketSession session = sessions.get(username);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(json));
            return true;
        }
        return false;
    }
}
