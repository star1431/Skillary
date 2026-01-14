package com.example.springskillaryback.common.dto;


public class DuplicateCheckResponse {
    private final boolean available;

    public DuplicateCheckResponse(boolean available) {
        this.available = available;
    }

    public boolean isAvailable() {
        return available;
    }
}