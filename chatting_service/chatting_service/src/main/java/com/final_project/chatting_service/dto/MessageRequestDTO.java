package com.final_project.chatting_service.dto;


public class MessageRequestDTO {

    private long id;
    private String sender;
    private String receiver;
    private long timestamp;
    private String text;

    public MessageRequestDTO() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getReceiver() { return receiver; }
    public void setReceiver(String receiver) { this.receiver = receiver; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
