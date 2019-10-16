package com.tericcabrel.osiris.controllers;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;
import com.tericcabrel.osiris.models.SocketMessage;
import com.tericcabrel.osiris.utils.Messaging;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.nio.charset.StandardCharsets;

@Controller
public class SocketController {

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public SocketMessage send(SocketMessage message) throws Exception {

        Thread.sleep(1000); // simulated delay

        return message;
    }
}
