package com.fidabet.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisherService {

    private static final Logger log = LoggerFactory.getLogger(EventPublisherService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public EventPublisherService(
            @Autowired(required = false) KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishEvent(String topic, String key, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            if (kafkaTemplate != null) {
                kafkaTemplate.send(topic, key, jsonPayload)
                        .whenComplete((result, ex) -> {
                            if (ex == null) {
                                log.debug("Kafka event sent to {} [key: {}]", topic, key);
                            } else {
                                log.warn("Failed to send Kafka event to {}: {}", topic, ex.getMessage());
                            }
                        });
            } else {
                log.debug("[IN-APP EVENT] Topic: {}, Key: {}, Payload: {}", topic, key, jsonPayload);
            }
        } catch (Exception e) {
            log.error("Failed to serialize or publish Kafka event to topic {}: {}", topic, e.getMessage());
        }
    }
}
