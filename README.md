
# API do Wyszukiwania Filmów


API umożliwia wyszukiwanie filmów w bazie danych za pomocą dwóch endpointów: `/oldest/:count` i `/upload`.

### Endpoint 1: Najstarsze Filmy

- **GET** `/oldest/:count`
- Zwraca listę najstarszych filmów wydanych przed 1950 rokiem.
- **Parametry**:
  - `count` - liczba filmów do pobrania.

**Przykład użycia:**
```bash
@ /oldest/5
```



### Endpoint 2: Wyszukiwanie za Pomocą Wektora

- **POST** `/upload`
- Umożliwia przesłanie pliku z wektorem zapytania i zwraca listę podobnych filmów.
- **Parametry**:
  - `file` - plik JSON zawierający wektor zapytania.


**Odpowiedź:**
```json
[
  {
    "title": "The Perils of Pauline",
    "plot": "Young Pauline is left a lot of money...",
    "score": 0.95
  },
  ...
]
```

