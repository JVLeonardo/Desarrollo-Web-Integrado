package com.reusotech.api.domain.exception;

public class AuditorReadOnlyException extends RuntimeException {
    public AuditorReadOnlyException(String message) {
        super(message);
    }
}
