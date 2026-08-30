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
