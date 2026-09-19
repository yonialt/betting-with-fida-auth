package com.fidabet.backend.exception;

/** Thrown when login credentials are missing, malformed, or do not match an account. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
