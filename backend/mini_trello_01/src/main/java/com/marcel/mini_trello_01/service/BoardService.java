package com.marcel.mini_trello_01.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.marcel.mini_trello_01.model.Board;
import com.marcel.mini_trello_01.repository.BoardRepository;

import com.marcel.mini_trello_01.exception.BoardNotFoundException;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public Board create(String title, String ownerId) {

        Board board = Board.builder()
                .title(title)
                .ownerId(ownerId)
                .createdAt(Instant.now())
                .build();

        return boardRepository.save(board);
    }

    public List<Board> findByOwnerId(String ownerId) {
        return boardRepository.findByOwnerId(ownerId);
    }

    public Board findByIdAndOwnerId(String boardId, String ownerId) {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Board not found")
                );

        if (!board.getOwnerId().equals(ownerId)) {
            throw new BoardNotFoundException("Board not found");
        }

        return board;
    }

    public void delete(String boardId, String ownerId) {

        Board board = findByIdAndOwnerId(boardId, ownerId);

        boardRepository.delete(board);
    }

}