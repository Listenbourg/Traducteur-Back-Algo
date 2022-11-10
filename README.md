# Traducteur Listenbourgeois

Node.JS back-end application to manage translation of listenbourgeois language. Only available with french.

## Public API

Free public API is available with no requests limit.

----

### Server :

`http://51.210.104.99:1841/`

----


### Methods : 

---


- `POST /translate`
  *Translate text into an other language*

  **Arguments in body :**
   - **from** : String
   --> Original language

   - **to** : String
   --> Target language

   - **text** : String
   --> Text to translate
   
   
   **Responses :**
   
   - Success : 
   ```json
   {
     "status": 200,
     "response": "bòendae",
     "alt_response": "bòendae",
     "detail_reponse": "[{\"word\":\"bòendae\",\"score\":1}]"
   }
   ```
   
   - Error :
   ```json
   {
     "status": 404,
     "response": "[error]"
   }
   ```

---

- `GET /translate`
  *Translate text into an other language*

  **Arguments in params :**
   - **from** : String
   --> Original language

   - **to** : String
   --> Target language

   - **text** : String
   --> Text to translate
   
   **Responses :**
   
   - Success : 
   ```json
   {
     "status": 200,
     "response": "bòendae",
     "alt_response": "bòendae",
     "detail_reponse": "[{\"word\":\"bòendae\",\"score\":1}]"
   }
   ```
   
   - Error :
   ```json
   {
     "status": 404,
     "response": "[error]"
   }
   ```
