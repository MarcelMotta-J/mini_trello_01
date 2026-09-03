package com.marcel.mini_trello_01.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marcel.mini_trello_01.model.Card;
import com.marcel.mini_trello_01.repository.UserRepository;
import com.marcel.mini_trello_01.service.CardService;

import org.springframework.web.bind.annotation.DeleteMapping;

import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/boards/{boardId}/columns/{columnId}/cards")
public class CardController {

    private final CardService cardService;
    private final UserRepository userRepository;

    public CardController(
            CardService cardService,
            UserRepository userRepository
    ) {
        this.cardService = cardService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Card> create(
            @PathVariable String boardId,
            @PathVariable String columnId,
            @RequestBody CreateCardRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Card card = cardService.create(
                boardId,
                columnId,
                request.title(),
                request.description(),
                request.position(),
                request.dueDate(),
                user.getId()
        );

        return ResponseEntity.ok(card);
    }

    @GetMapping
    public ResponseEntity<List<Card>> list(
            @PathVariable String boardId,
            @PathVariable String columnId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        return ResponseEntity.ok(
                cardService.findByColumnId(
                        boardId,
                        columnId,
                        user.getId()
                )
        );
    }

    public record CreateCardRequest(
            String title,
            String description,
            Integer position,
            Instant dueDate
    ) {
    }

    @GetMapping("/{cardId}")
    public ResponseEntity<Card> findById(
            @PathVariable String boardId,
            @PathVariable String columnId,
            @PathVariable String cardId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Card card = cardService.findByIdAndColumnId(
                cardId,
                boardId,
                columnId,
                user.getId()
        );

        return ResponseEntity.ok(card);
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> delete(
            @PathVariable String boardId,
            @PathVariable String columnId,
            @PathVariable String cardId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        cardService.delete(
                cardId,
                boardId,
                columnId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

    // PUT /api/boards/{boardId}/columns/{columnId}/cards/{cardId}
    @PutMapping("/{cardId}")
    public ResponseEntity<Card> update(
            @PathVariable String boardId,
            @PathVariable String columnId,
            @PathVariable String cardId,
            @RequestBody UpdateCardRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Card card = cardService.update(
                cardId,
                boardId,
                columnId,
                request.columnId(),
                request.title(),
                request.description(),
                request.position(),
                request.dueDate(),
                user.getId()
        );

        return ResponseEntity.ok(card);
    }

    public record UpdateCardRequest(
            String columnId,
            String title,
            String description,
            Integer position,
            Instant dueDate
    ) {
    }

}