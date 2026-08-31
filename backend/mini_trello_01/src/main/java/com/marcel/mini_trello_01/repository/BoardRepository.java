package com.marcel.mini_trello_01.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.marcel.mini_trello_01.model.Board;

public interface BoardRepository extends MongoRepository<Board, String> {

    List<Board> findByOwnerId(String ownerId);
}