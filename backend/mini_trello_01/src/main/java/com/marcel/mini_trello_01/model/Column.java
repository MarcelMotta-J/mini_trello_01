package com.marcel.mini_trello_01.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "columns")
public class Column {

    @Id
    private String id;

    private String boardId;

    private String title;

    private Integer position;

    private Instant createdAt;
}