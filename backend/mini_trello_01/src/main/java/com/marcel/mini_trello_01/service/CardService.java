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

        // Valida a posição antes de qualquer reorganização dos Cards.
        validateCreatePosition(
                columnId,
                position
        );

        // MOLA EMPURRA:
        // Abre espaço na posição desejada.
        // Todos os Cards a partir dessa posição descem uma posição.
        // Abre espaço na posição desejada.
        openGapInDestinationColumn(
                columnId,
                position
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

        int oldPosition = card.getPosition();

        cardRepository.delete(card);

        // MOLA PUXA:
        // Fecha o espaço deixado pelo Card removido.
        // Todos os Cards posteriores sobem uma posição.
        closeGapInSourceColumn(
                columnId,
                oldPosition,
                cardId
        );
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

        // Limitador de posição.
        // Valida antes de qualquer reorganização dos Cards.
        validateUpdatePosition(
                currentColumnId,
                newColumnId,
                position
        );

        // Se o Card permanecer na mesma Column, reorganiza as posições.
        // Caso seja movido para outra Column, atualiza a Column de destino
        // e mantém a nova posição informada.
        boolean sameColumn =
                currentColumnId.equals(newColumnId);

        card.setTitle(title);
        card.setDescription(description);
        card.setDueDate(dueDate);

        if (sameColumn) {
            reorderWithinSameColumn(
                    card,
                    currentColumnId,
                    position
            );
        } else {
            int oldPosition = card.getPosition();

            // MOLA PUXA:
            // Fecha o espaço deixado pelo Card.
            // Todos os Cards posteriores sobem uma posição.
            // Fecha o espaço deixado na Column de origem.
            closeGapInSourceColumn(
                    currentColumnId,
                    oldPosition,
                    card.getId()
            );

            // MOLA EMPURRA:
            // Abre espaço na posição desejada.
            // Todos os Cards a partir dessa posição descem uma posição.
            // Abre espaço para o Card na Column de destino.
            openGapInDestinationColumn(
                    newColumnId,
                    position
            );

            card.setColumnId(newColumnId);
            card.setPosition(position);
        }

        return cardRepository.save(card);
    }

    private void reorderWithinSameColumn(
            Card card,
            String columnId,
            Integer newPosition
    ) {
        List<Card> cards =
                cardRepository.findByColumnIdOrderByPositionAsc(columnId);

        int oldPosition = card.getPosition();

        if (oldPosition < newPosition) {
            for (Card current : cards) {
                if (current.getId().equals(card.getId())) {
                    continue;
                }

                if (current.getPosition() > oldPosition &&
                        current.getPosition() <= newPosition) {

                    current.setPosition(current.getPosition() - 1);
                }
            }
        }

        if (oldPosition > newPosition) {
            for (Card current : cards) {
                if (current.getId().equals(card.getId())) {
                    continue;
                }

                if (current.getPosition() >= newPosition &&
                        current.getPosition() < oldPosition) {

                    current.setPosition(current.getPosition() + 1);
                }
            }
        }

        card.setPosition(newPosition);

        cardRepository.saveAll(cards);
    }

    // Fecha o espaço deixado pelo Card na Column de origem.
    // Todos os Cards posteriores sobem uma posição.
    private void closeGapInSourceColumn(
            String columnId,
            Integer oldPosition,
            String movingCardId
    ) {
        List<Card> cards =
                cardRepository.findByColumnIdOrderByPositionAsc(columnId);

        for (Card current : cards) {
            if (current.getId().equals(movingCardId)) {
                continue;
            }

            if (current.getPosition() > oldPosition) {
                current.setPosition(current.getPosition() - 1);
            }
        }

        cardRepository.saveAll(cards);
    }

    // Abre espaço para o Card na Column de destino.
    // Todos os Cards a partir da nova posição descem uma posição.
    private void openGapInDestinationColumn(
            String columnId,
            Integer newPosition
    ) {
        List<Card> cards =
                cardRepository.findByColumnIdOrderByPositionAsc(columnId);

        for (Card current : cards) {
            if (current.getPosition() >= newPosition) {
                current.setPosition(current.getPosition() + 1);
            }
        }
        cardRepository.saveAll(cards);
    }

    private void validateCreatePosition(
            String columnId,
            Integer position
    ) {

        long count = cardRepository.countByColumnId(columnId);

        if (position > count) {
            throw new IllegalArgumentException(
                    "Invalid position for create"
            );
        }
    }

    private void validateUpdatePosition(
            String currentColumnId,
            String newColumnId,
            Integer position
    ) {

        boolean sameColumn =
                currentColumnId.equals(newColumnId);

        long count =
                cardRepository.countByColumnId(newColumnId);

        if (sameColumn) {

            if (position >= count) {
                throw new IllegalArgumentException(
                        "Invalid position for update"
                );
            }

        } else {

            if (position > count) {
                throw new IllegalArgumentException(
                        "Invalid position for move"
                );
            }
        }
    }

}
