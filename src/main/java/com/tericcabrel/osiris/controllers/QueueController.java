package com.tericcabrel.osiris.controllers;

import com.tericcabrel.osiris.utils.Helpers;
import com.tericcabrel.osiris.utils.Messaging;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Controller;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

@Controller
public class QueueController {
    @RabbitListener(queues = "myQueue")
    public void listen(String in) {
        System.out.println("Message read from myQueue : " + in);
        byte[] str = "49,52,48,48,48".getBytes(StandardCharsets.UTF_8);
        System.out.println(Helpers.byteArrayToString(str));
    }

    @RabbitListener(queues = Messaging.Q_APPLET_SELECTED_RESPONSE)
    public void cardInserted(String in) {
        System.out.println("Message read from Q_APPLET_SELECTED_RESPONSE : " + in);
    }

    @RabbitListener(queues = Messaging.Q_CARD_REMOVED_RESPONSE)
    public void cardRemoved(String in) {
        System.out.println("Message read from Q_CARD_REMOVED_RESPONSE : " + in);
    }
}
