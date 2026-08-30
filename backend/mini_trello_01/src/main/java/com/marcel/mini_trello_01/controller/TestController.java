package com.marcel.mini_trello_01.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    /**
     * Endpoint simples para testar autenticação JWT.
     *
     * Testes:
     * 1. GET /api/test sem token -> 401 Unauthorized
     * 2. GET /api/test com Bearer Token válido -> 200 OK
     *
     * Mantido no projeto como referência de estudo.
     */

    @GetMapping
    public String test() {
        return "JWT funcionando";
    }

    /*
    * brainiac@brainiac-Inspiron-3437:~/Documents/javaProjects$ curl -i http://localhost:8081/api/test
HTTP/1.1 401
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
WWW-Authenticate: Bearer resource_metadata="http://localhost:8081/.well-known/oauth-protected-resource"
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Length: 0
Date: Sun, 30 Aug 2026 00:41:35 GMT


brainiac@brainiac-Inspiron-3437:~/Documents/javaProjects$ curl -sS -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "123456"
  }' | jq
{
  "token": "eyJhbCLASSIFIED",
  "email": "admin@teste.com"
}
brainiac@brainiac-Inspiron-3437:~/Documents/javaProjects$

curl -i http://localhost:8081/api/test \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -i http://localhost:8081/api/test \
  -H "Authorization: Bearer eyJhbCLASSIFIED"


brainiac@brainiac-Inspiron-3437:~/Documents/javaProjects$ curl -i http://localhost:8081/api/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJpCLASSIFIED"
HTTP/1.1 200
Vary: Origin
Vary: Access-Control-Request-Method
Vary: Access-Control-Request-Headers
X-Content-Type-Options: nosniff
X-XSS-Protection: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: DENY
Content-Type: text/plain;charset=UTF-8
Content-Length: 15
Date: Sun, 30 Aug 2026 00:46:03 GMT

JWT funcionandobrainiac@brainiac-Inspiron-3437:~/Documents/javaProjects$

    *
    * */

}