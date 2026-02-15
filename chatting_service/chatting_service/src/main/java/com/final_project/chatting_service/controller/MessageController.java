package com.final_project.chatting_service.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.final_project.chatting_service.dto.MessageRequestDTO;
import com.final_project.chatting_service.handler.ChatSocketHandler;
import com.final_project.chatting_service.service.MessageService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final ChatSocketHandler chatSocketHandler;
    private final MessageService messageService;
    public MessageController(ChatSocketHandler chatSocketHandler, MessageService messageService) {
        this.chatSocketHandler = chatSocketHandler;
        this.messageService = messageService;
    }
//    @GetMapping("/health")
//    public boolean health () {
//        return true;
//    }
    @PostMapping("/message")
    public String send (@RequestBody MessageRequestDTO message) throws Exception {
        System.out.println("Received the message");
        String json = new ObjectMapper().writeValueAsString(message);
        try {
            boolean success = chatSocketHandler.sendToUser(message.getReceiver(), json);
            messageService.saveMessage(message);
            if (!success) {
                return "User is Offline";
            }
            return "User is Online";
        } catch ( Exception e) {
            return "Failed to mend message";
        }
    }

}
