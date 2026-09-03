#!/bin/bash

API="http://localhost:8081"


# =========================================================
# USAGE
# =========================================================
#
# chmod +x api.sh
# source ./api.sh
#
# or:
# . ./api.sh
#
# =========================================================


# =========================================================
# HELPERS
# =========================================================

require_token() {
    if [ -z "$TOKEN" ]; then
        echo "TOKEN is empty. Run login first."
        return 1
    fi
}


# =========================================================
# AUTH
# =========================================================

register() {
    local name="$1"
    local email="$2"

    if [ -z "$name" ] || [ -z "$email" ]; then
        echo "Usage: register <name> <email>"
        return 1
    fi

    read -s -p "Password for $email: " password
    echo

    if [ -z "$password" ]; then
        echo "Password cannot be empty."
        return 1
    fi

    curl -sS -X POST "$API/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\":\"$name\",
            \"email\":\"$email\",
            \"password\":\"$password\"
        }" | jq
}


login() {
    local email="${1:-admin@teste.com}"

    read -s -p "Password for $email: " password
    echo

    local response

    response=$(
        curl -sS -X POST "$API/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\":\"$email\",
                \"password\":\"$password\"
            }"
    )

    TOKEN=$(printf '%s' "$response" | jq -r '.token // empty')

    if [ -z "$TOKEN" ]; then
        echo "Login failed."
        unset TOKEN
        return 1
    fi

    export TOKEN

    echo "Login successful."
    echo "JWT loaded into TOKEN."
}


logout() {
    unset TOKEN
    echo "TOKEN removed."
}


show_token() {
    require_token || return 1

    echo "${TOKEN:0:25}..."
}


test_token() {
    require_token || return 1

    curl -sS "$API/api/test" \
        -H "Authorization: Bearer $TOKEN"

    echo
}


# =========================================================
# BOARDS
# =========================================================

create_board() {
    require_token || return 1

    local title="$*"

    if [ -z "$title" ]; then
        echo "Usage: create_board <title>"
        return 1
    fi

    local payload

    payload=$(
        jq -n \
            --arg title "$title" \
            '{title: $title}'
    )

    curl -sS -X POST "$API/api/boards" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" |
        jq
}


boards() {
    require_token || return 1

    curl -sS "$API/api/boards" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}

board() {
    require_token || return 1

    local id="$1"

    if [ -z "$id" ]; then
        echo "Usage: board <id>"
        return 1
    fi

    curl -sS "$API/api/boards/$id" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}


delete_board() {
    require_token || return 1

    local id="$1"

    if [ -z "$id" ]; then
        echo "Usage: delete_board <id>"
        return 1
    fi

    curl -i -X DELETE "$API/api/boards/$id" \
        -H "Authorization: Bearer $TOKEN"

    echo
}


# =========================================================
# COLUMNS
# =========================================================

create_column() {
    require_token || return 1

    local board_id="$1"
    local title="$2"
    local position="$3"

    if [ -z "$board_id" ] || [ -z "$title" ] || [ -z "$position" ]; then
        echo 'Usage: create_column <boardId> "<title>" <position>'
        return 1
    fi

    local payload

    payload=$(
        jq -n \
            --arg title "$title" \
            --argjson position "$position" \
            '{
                title: $title,
                position: $position
            }'
    )

    curl -sS -X POST "$API/api/boards/$board_id/columns" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" |
        jq
}


columns() {
    require_token || return 1

    local board_id="$1"

    if [ -z "$board_id" ]; then
        echo "Usage: columns <boardId>"
        return 1
    fi

    curl -sS "$API/api/boards/$board_id/columns" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}


column() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"

    if [ -z "$board_id" ] || [ -z "$column_id" ]; then
        echo "Usage: column <boardId> <columnId>"
        return 1
    fi

    curl -sS "$API/api/boards/$board_id/columns/$column_id" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}


delete_column() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"

    if [ -z "$board_id" ] || [ -z "$column_id" ]; then
        echo "Usage: delete_column <boardId> <columnId>"
        return 1
    fi

    curl -i -X DELETE \
        "$API/api/boards/$board_id/columns/$column_id" \
        -H "Authorization: Bearer $TOKEN"

    echo
}


# =========================================================
# CARDS
# =========================================================

create_card() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"
    local title="$3"
    local description="$4"
    local position="$5"
    local due_date="$6"

    if [ -z "$board_id" ] || \
       [ -z "$column_id" ] || \
       [ -z "$title" ] || \
       [ -z "$position" ]; then

        echo 'Usage: create_card <boardId> <columnId> "<title>" "<description>" <position> [dueDate]'
        return 1
    fi

    local payload

    if [ -n "$due_date" ]; then
        payload=$(
            jq -n \
                --arg title "$title" \
                --arg description "$description" \
                --argjson position "$position" \
                --arg dueDate "$due_date" \
                '{
                    title: $title,
                    description: $description,
                    position: $position,
                    dueDate: $dueDate
                }'
        )
    else
        payload=$(
            jq -n \
                --arg title "$title" \
                --arg description "$description" \
                --argjson position "$position" \
                '{
                    title: $title,
                    description: $description,
                    position: $position,
                    dueDate: null
                }'
        )
    fi

    curl -sS -X POST \
        "$API/api/boards/$board_id/columns/$column_id/cards" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" |
        jq
}


cards() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"

    if [ -z "$board_id" ] || [ -z "$column_id" ]; then
        echo "Usage: cards <boardId> <columnId>"
        return 1
    fi

    curl -sS \
        "$API/api/boards/$board_id/columns/$column_id/cards" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}


card() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"
    local card_id="$3"

    if [ -z "$board_id" ] || \
       [ -z "$column_id" ] || \
       [ -z "$card_id" ]; then

        echo "Usage: card <boardId> <columnId> <cardId>"
        return 1
    fi

    curl -sS \
        "$API/api/boards/$board_id/columns/$column_id/cards/$card_id" \
        -H "Authorization: Bearer $TOKEN" |
        jq
}


delete_card() {
    require_token || return 1

    local board_id="$1"
    local column_id="$2"
    local card_id="$3"

    if [ -z "$board_id" ] || \
       [ -z "$column_id" ] || \
       [ -z "$card_id" ]; then

        echo "Usage: delete_card <boardId> <columnId> <cardId>"
        return 1
    fi

    curl -i -X DELETE \
        "$API/api/boards/$board_id/columns/$column_id/cards/$card_id" \
        -H "Authorization: Bearer $TOKEN"

    echo
}


update_card() {
    require_token || return 1

    local board_id="$1"
    local current_column_id="$2"
    local card_id="$3"
    local new_column_id="$4"
    local title="$5"
    local description="$6"
    local position="$7"
    local due_date="$8"

    if [ -z "$board_id" ] || \
       [ -z "$current_column_id" ] || \
       [ -z "$card_id" ] || \
       [ -z "$new_column_id" ] || \
       [ -z "$title" ] || \
       [ -z "$position" ]; then

        echo 'Usage: update_card <boardId> <currentColumnId> <cardId> <newColumnId> "<title>" "<description>" <position> [dueDate]'
        return 1
    fi

    local payload

    if [ -n "$due_date" ]; then
        payload=$(
            jq -n \
                --arg columnId "$new_column_id" \
                --arg title "$title" \
                --arg description "$description" \
                --argjson position "$position" \
                --arg dueDate "$due_date" \
                '{
                    columnId: $columnId,
                    title: $title,
                    description: $description,
                    position: $position,
                    dueDate: $dueDate
                }'
        )
    else
        payload=$(
            jq -n \
                --arg columnId "$new_column_id" \
                --arg title "$title" \
                --arg description "$description" \
                --argjson position "$position" \
                '{
                    columnId: $columnId,
                    title: $title,
                    description: $description,
                    position: $position,
                    dueDate: null
                }'
        )
    fi

    curl -sS -X PUT \
        "$API/api/boards/$board_id/columns/$current_column_id/cards/$card_id" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" |
        jq
}
