package com.marcel.mini_trello_01.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marcel.mini_trello_01.model.Column;
import com.marcel.mini_trello_01.repository.UserRepository;
import com.marcel.mini_trello_01.service.ColumnService;

import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final ColumnService columnService;
    private final UserRepository userRepository;

    public ColumnController(
            ColumnService columnService,
            UserRepository userRepository
    ) {
        this.columnService = columnService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Column> create(
            @PathVariable String boardId,
            @RequestBody CreateColumnRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Column column = columnService.create(
                boardId,
                request.title(),
                request.position(),
                user.getId()
        );

        return ResponseEntity.ok(column);
    }

    @GetMapping
    public ResponseEntity<List<Column>> list(
            @PathVariable String boardId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        return ResponseEntity.ok(
                columnService.findByBoardId(
                        boardId,
                        user.getId()
                )
        );
    }

    public record CreateColumnRequest(
            String title,
            Integer position
    ) {
    }

    @GetMapping("/{columnId}")
    public ResponseEntity<Column> findById(
            @PathVariable String boardId,
            @PathVariable String columnId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Column column = columnService.findByIdAndBoardId(
                columnId,
                boardId,
                user.getId()
        );

        return ResponseEntity.ok(column);
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> delete(
            @PathVariable String boardId,
            @PathVariable String columnId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        columnService.delete(
                columnId,
                boardId,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

}
