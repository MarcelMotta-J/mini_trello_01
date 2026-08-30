package com.marcel.mini_trello_01.dto;

import java.time.Instant;

public record UserResponse(
        String id,
        String name,
        String email,
        Instant createdAt
) {
}