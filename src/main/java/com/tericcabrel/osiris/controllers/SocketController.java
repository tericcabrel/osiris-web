package com.tericcabrel.osiris.controllers;

import com.tericcabrel.osiris.models.SocketMessage;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SocketController {
    RabbitTemplate rabbitTemplate;

    public SocketController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public SocketMessage send(SocketMessage message) throws Exception {

        rabbitTemplate.convertAndSend("myQueue", "Hello, world!");

        Thread.sleep(1000); // simulated delay

        return message;
    }

    @Bean
    public Queue myQueue() {
        return new Queue("myQueue", false);
    }
}
