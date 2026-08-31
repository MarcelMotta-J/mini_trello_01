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

    public CardService(
            CardRepository cardRepository,
            ColumnService columnService
    ) {
        this.cardRepository = cardRepository;
        this.columnService = columnService;
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

}
