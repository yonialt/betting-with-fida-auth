package com.fidabet.backend.exception;

public class BetNotFoundException extends RuntimeException {

    public BetNotFoundException(String message) {
        super(message);
    }

    public BetNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
