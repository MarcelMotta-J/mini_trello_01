package com.marcel.mini_trello_01.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.marcel.mini_trello_01.model.Column;

public interface ColumnRepository extends MongoRepository<Column, String> {

    List<Column> findByBoardIdOrderByPositionAsc(String boardId);
}