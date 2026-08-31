package com.marcel.mini_trello_01.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.marcel.mini_trello_01.model.Card;

public interface CardRepository extends MongoRepository<Card, String> {

    List<Card> findByColumnIdOrderByPositionAsc(String columnId);
}