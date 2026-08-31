package com.marcel.mini_trello_01.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.marcel.mini_trello_01.model.Board;
import com.marcel.mini_trello_01.repository.UserRepository;
import com.marcel.mini_trello_01.service.BoardService;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;
    private final UserRepository userRepository;

    public BoardController(
            BoardService boardService,
            UserRepository userRepository
    ) {
        this.boardService = boardService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Board> create(
            @RequestBody CreateBoardRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Board board = boardService.create(
                request.title(),
                user.getId()
        );

        return ResponseEntity.ok(board);
    }

    @GetMapping
    public ResponseEntity<List<Board>> list(
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(
                boardService.findByOwnerId(user.getId())
        );
    }

    public record CreateBoardRequest(
            String title
    ) {
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> findById(
            @PathVariable String id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Board board = boardService.findByIdAndOwnerId(
                id,
                user.getId()
        );

        return ResponseEntity.ok(board);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        boardService.delete(
                id,
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

}
