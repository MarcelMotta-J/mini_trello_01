package com.marcel.mini_trello_01.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.marcel.mini_trello_01.model.Column;
import com.marcel.mini_trello_01.repository.ColumnRepository;

import com.marcel.mini_trello_01.exception.ColumnNotFoundException;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardService boardService;

    public ColumnService(
            ColumnRepository columnRepository,
            BoardService boardService
    ) {
        this.columnRepository = columnRepository;
        this.boardService = boardService;
    }

    public Column create(
            String boardId,
            String title,
            Integer position,
            String ownerId
    ) {

        // Garante que o Board existe E pertence ao usuário.
        boardService.findByIdAndOwnerId(boardId, ownerId);

        Column column = Column.builder()
                .boardId(boardId)
                .title(title)
                .position(position)
                .createdAt(Instant.now())
                .build();

        return columnRepository.save(column);
    }

    public List<Column> findByBoardId(
            String boardId,
            String ownerId
    ) {

        // Mesma proteção para a listagem.
        boardService.findByIdAndOwnerId(boardId, ownerId);

        return columnRepository
                .findByBoardIdOrderByPositionAsc(boardId);
    }

    public Column findByIdAndBoardId(
            String columnId,
            String boardId,
            String ownerId
    ) {

        // Primeiro garante que o Board pertence ao usuário.
        boardService.findByIdAndOwnerId(boardId, ownerId);

        Column column = columnRepository.findById(columnId)
                .orElseThrow(() ->
                        new ColumnNotFoundException("Column not found")
                );

        // Garante que a Column realmente pertence ao Board informado.
        if (!column.getBoardId().equals(boardId)) {
            throw new ColumnNotFoundException("Column not found");
        }

        return column;
    }

    public void delete(
            String columnId,
            String boardId,
            String ownerId
    ) {

        Column column = findByIdAndBoardId(
                columnId,
                boardId,
                ownerId
        );

        columnRepository.delete(column);
    }

}