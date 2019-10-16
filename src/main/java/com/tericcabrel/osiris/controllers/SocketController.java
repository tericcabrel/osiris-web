package com.tericcabrel.osiris.controllers;

import com.rabbitmq.client.Channel;
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

    @MessageMapping("/pinAuthentication")
    public void pinAuthentication(SocketMessage message) throws Exception {
        Channel channel = Messaging.getChannel();

        channel.queueDeclare(Messaging.Q_AUTHENTICATE_REQUEST, false, false, false, null);
        channel.basicPublish("", Messaging.Q_AUTHENTICATE_REQUEST, null, message.getMessage().getBytes(StandardCharsets.UTF_8));
        System.out.println(" [x] Sent to queue " + Messaging.Q_AUTHENTICATE_REQUEST);
    }
}
