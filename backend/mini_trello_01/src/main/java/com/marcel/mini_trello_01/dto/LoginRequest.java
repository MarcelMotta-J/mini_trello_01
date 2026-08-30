package com.marcel.mini_trello_01.dto;

public record LoginRequest(
        String email,
        String password
) {
}
