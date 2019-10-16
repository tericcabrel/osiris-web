package com.tericcabrel.osiris.listeners;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;
import com.tericcabrel.osiris.models.SocketMessage;
import com.tericcabrel.osiris.utils.Messaging;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");

        SocketMessage message = new SocketMessage();
        Channel channel = Messaging.getChannel();

        try {
            channel.queueDeclare(Messaging.Q_APPLET_SELECTED_RESPONSE, false, false, false, null);

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String content = new String(delivery.getBody(), StandardCharsets.UTF_8);
                System.out.println(" [x] Received '" + content + "'");
                message.setMessage(content);

                if (messagingTemplate != null) {
                    System.out.println("sent to the client");
                    messagingTemplate.convertAndSend("/topic/cardInserted", message);
                } else {
                    System.out.println("Can't sent to the client");
                }
            };
            channel.basicConsume(Messaging.Q_APPLET_SELECTED_RESPONSE, true, deliverCallback, consumerTag -> { });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        //StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // String username = (String) headerAccessor.getSessionAttributes().get("username");
        // if(username != null) {
            // logger.info("User Disconnected : " + username);
            logger.info("User Disconnected : ");

            SocketMessage message = new SocketMessage();
            message.setCode("DSCT").setMessage("Bye");

            messagingTemplate.convertAndSend("/topic/greetings", message);
        // }
    }
}
