package com.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class Message {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public void getMessage(String message) {
        System.out.println("1" + message);
    }

    @GetMapping("/hello")
    public void getMes(String message) {
        System.out.println("2" + message);
    }
}
