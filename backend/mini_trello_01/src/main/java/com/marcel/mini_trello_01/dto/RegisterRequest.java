package com.marcel.mini_trello_01.dto;

public record RegisterRequest(
        String name,
        String email,
        String password
) {
}
