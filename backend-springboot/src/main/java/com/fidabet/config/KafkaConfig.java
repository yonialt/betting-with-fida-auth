package com.fidabet.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConfig {

    public static final String TOPIC_ODDS_UPDATES = "fida-bet.odds.updates";
    public static final String TOPIC_ODDS_LOCKED = "fida-bet.odds.locked";
    public static final String TOPIC_MATCH_SCORE = "fida-bet.match.score";
    public static final String TOPIC_MATCH_EVENTS = "fida-bet.match.events";
    public static final String TOPIC_MATCH_STATUS = "fida-bet.match.status";

    public static final String TOPIC_BET_PLACED = "fida-bet.bet.placed";
    public static final String TOPIC_BET_SETTLED = "fida-bet.bet.settled";
    public static final String TOPIC_BET_CASHEDOUT = "fida-bet.bet.cashedout";

    public static final String TOPIC_PAYMENT_DEPOSIT = "fida-bet.payment.deposit";
    public static final String TOPIC_PAYMENT_COMPLETED = "fida-bet.payment.completed";
    public static final String TOPIC_PAYMENT_FAILED = "fida-bet.payment.failed";
    public static final String TOPIC_PAYMENT_WITHDRAWAL = "fida-bet.payment.withdrawal";

    public static final String TOPIC_USER_REGISTERED = "fida-bet.user.registered";
    public static final String TOPIC_USER_BALANCE_UPDATE = "fida-bet.user.balance.update";
    public static final String TOPIC_USER_KYC_SUBMITTED = "fida-bet.user.kyc.submitted";

    public static final String TOPIC_NOTIFICATION_SMS = "fida-bet.notification.sms";
    public static final String TOPIC_NOTIFICATION_PUSH = "fida-bet.notification.push";
    public static final String TOPIC_NOTIFICATION_EMAIL = "fida-bet.notification.email";

    public static final String TOPIC_ANALYTICS_BET = "fida-bet.analytics.bet";
    public static final String TOPIC_ANALYTICS_USER = "fida-bet.analytics.user";

    @Bean
    public NewTopic oddsUpdatesTopic() {
        return TopicBuilder.name(TOPIC_ODDS_UPDATES).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic betPlacedTopic() {
        return TopicBuilder.name(TOPIC_BET_PLACED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic betSettledTopic() {
        return TopicBuilder.name(TOPIC_BET_SETTLED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic paymentCompletedTopic() {
        return TopicBuilder.name(TOPIC_PAYMENT_COMPLETED).partitions(3).replicas(1).build();
    }
}
