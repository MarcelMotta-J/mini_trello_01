package com.marcel.mini_trello_01.dto;

public record LoginResponse(
        String token,
        String email
) {
}