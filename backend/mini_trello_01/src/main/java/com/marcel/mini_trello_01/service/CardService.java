package com.marcel.mini_trello_01.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.marcel.mini_trello_01.model.Card;
import com.marcel.mini_trello_01.repository.CardRepository;

import com.marcel.mini_trello_01.exception.CardNotFoundException;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ColumnService columnService;

    private final BoardService boardService;

    public CardService(
            CardRepository cardRepository,
            ColumnService columnService,
            BoardService boardService
    ) {
        this.cardRepository = cardRepository;
        this.columnService = columnService;
        this.boardService = boardService;
    }

    public Card create(
            String boardId,
            String columnId,
            String title,
            String description,
            Integer position,
            Instant dueDate,
            String ownerId
    ) {

        // Garante:
        // User -> Board -> Column
        columnService.findByIdAndBoardId(
                columnId,
                boardId,
                ownerId
        );

        Card card = Card.builder()
                .columnId(columnId)
                .title(title)
                .description(description)
                .position(position)
                .dueDate(dueDate)
                .createdAt(Instant.now())
                .build();

        return cardRepository.save(card);
    }

    public List<Card> findByColumnId(
            String boardId,
            String columnId,
            String ownerId
    ) {

        columnService.findByIdAndBoardId(
                columnId,
                boardId,
                ownerId
        );

        return cardRepository
                .findByColumnIdOrderByPositionAsc(columnId);
    }

    public Card findByIdAndColumnId(
            String cardId,
            String boardId,
            String columnId,
            String ownerId
    ) {

        columnService.findByIdAndBoardId(
                columnId,
                boardId,
                ownerId
        );

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() ->
                        new CardNotFoundException("Card not found")
                );

        if (!card.getColumnId().equals(columnId)) {
            throw new CardNotFoundException("Card not found");
        }

        return card;
    }

    public void delete(
            String cardId,
            String boardId,
            String columnId,
            String ownerId
    ) {

        Card card = findByIdAndColumnId(
                cardId,
                boardId,
                columnId,
                ownerId
        );

        cardRepository.delete(card);
    }


    public Card update(
            String cardId,
            String boardId,
            String currentColumnId,
            String newColumnId,
            String title,
            String description,
            Integer position,
            Instant dueDate,
            String ownerId
    ) {

        // Garante que o Board pertence ao usuário autenticado.
        boardService.findByIdAndOwnerId(boardId, ownerId);

        // Garante que a coluna atual pertence ao Board.
        columnService.findByIdAndBoardId(
                currentColumnId,
                boardId,
                ownerId
        );

        // Garante que a coluna de destino também pertence ao mesmo Board.
        columnService.findByIdAndBoardId(
                newColumnId,
                boardId,
                ownerId
        );

        Card card = findByIdAndColumnId(
                cardId,
                boardId,
                currentColumnId,
                ownerId
        );

        card.setColumnId(newColumnId);
        card.setTitle(title);
        card.setDescription(description);
        card.setPosition(position);
        card.setDueDate(dueDate);

        return cardRepository.save(card);
    }

}
