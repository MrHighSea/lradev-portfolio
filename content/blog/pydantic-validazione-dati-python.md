---
title: "Pydantic: Validazione Dati Python che Semplifica la Vita al Backend Developer"
date: "2025-12-10T10:00:00"
excerpt: "Scopri come Pydantic rivoluziona la validazione dei dati in Python con type hints, validazione automatica e serializzazione. Essenziale per FastAPI, Django e qualsiasi applicazione backend moderna."
category: "Backend"
author: "Luca Altimare"
---

# Pydantic: Validazione Dati Python che Semplifica la Vita al Backend Developer

Se sviluppi backend in Python e non usi ancora **Pydantic**, stai perdendo uno degli strumento più potenti per validazione, parsing e serializzazione dei dati. In questo articolo vedremo come Pydantic può trasformare il tuo codice da fragile a robusto.

## Cos'è Pydantic?

**Pydantic** è una libreria Python per la validazione dei dati basata su **type hints**. Utilizza le annotazioni di tipo native di Python per:

- ✅ Validare dati in ingresso automaticamente
- ✅ Convertire tipi di dato (parsing)
- ✅ Generare JSON Schema automaticamente
- ✅ Fornire messaggi di errore chiari e dettagliati
- ✅ Garantire type safety nel codice

### Perché Pydantic è Essenziale nel 2025?

```python
# ❌ SENZA Pydantic - Codice fragile e verbose
def create_user(data: dict):
    if 'email' not in data:
        raise ValueError("Email required")
    if not isinstance(data['email'], str):
        raise TypeError("Email must be string")
    if '@' not in data['email']:
        raise ValueError("Invalid email")
    if 'age' not in data:
        raise ValueError("Age required")
    if not isinstance(data['age'], int):
        raise TypeError("Age must be integer")
    if data['age'] < 0 or data['age'] > 150:
        raise ValueError("Invalid age")

    # ... e così via per ogni campo

# ✅ CON Pydantic - Pulito, sicuro, automatico
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    email: EmailStr
    age: int = Field(ge=0, le=150)

def create_user(data: dict):
    user = User(**data)  # Validazione automatica!
    return user
```

## Installazione e Setup

```bash
# Versione base
pip install pydantic

# Con validatori email (consigliato)
pip install pydantic[email]

# Per Pydantic V2 (ultima versione)
pip install "pydantic>=2.0"
```

## Validazione Base: Type Hints Potenziati

### Tipi Primitivi

```python
from pydantic import BaseModel
from datetime import datetime

class Product(BaseModel):
    name: str
    price: float
    in_stock: bool
    created_at: datetime

# ✅ Validazione automatica e conversione tipi
product = Product(
    name="Laptop",
    price="999.99",  # Convertito automaticamente a float
    in_stock="true",  # Convertito automaticamente a bool
    created_at="2025-12-10T10:00:00"  # Convertito a datetime
)

print(product.price)  # 999.99 (float)
print(product.in_stock)  # True (bool)
print(product.created_at)  # datetime object

# ❌ Errore di validazione chiaro
try:
    Product(name="Phone", price="invalid", in_stock=True, created_at="2025-12-10")
except Exception as e:
    print(e)
    # 1 validation error for Product
    # price
    #   Input should be a valid number [type=float_type]
```

### Validatori Avanzati con Field

```python
from pydantic import BaseModel, Field
from typing import Optional

class Article(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    slug: str = Field(pattern=r'^[a-z0-9-]+$')
    views: int = Field(ge=0, default=0)
    rating: float = Field(ge=0.0, le=5.0)
    tags: list[str] = Field(max_length=10)
    author_id: Optional[int] = None

# ✅ Validazione con vincoli
article = Article(
    title="Pydantic Guide",
    slug="pydantic-guide",
    rating=4.5,
    tags=["python", "backend"]
)

# ❌ Errore: titolo troppo corto
try:
    Article(title="Hi", slug="hi", rating=3.0, tags=[])
except Exception as e:
    print(e)
    # title: String should have at least 5 characters
```

## Email, URL e Altri Tipi Specializzati

```python
from pydantic import BaseModel, EmailStr, HttpUrl, IPvAnyAddress
from datetime import date

class UserProfile(BaseModel):
    email: EmailStr  # Validazione email automatica
    website: HttpUrl  # Validazione URL
    ip_address: IPvAnyAddress  # IPv4 o IPv6
    birth_date: date

# ✅ Validazione automatica
profile = UserProfile(
    email="luca@example.com",
    website="https://lradev.app",
    ip_address="192.168.1.1",
    birth_date="1990-01-01"
)

# ❌ Email non valida
try:
    UserProfile(
        email="not-an-email",
        website="https://example.com",
        ip_address="127.0.0.1",
        birth_date="1990-01-01"
    )
except Exception as e:
    print(e)
    # email: value is not a valid email address
```

## Validatori Custom: Logica di Business

### Validator Decorator

```python
from pydantic import BaseModel, field_validator, model_validator
from typing import Self

class BankAccount(BaseModel):
    account_number: str
    balance: float
    currency: str

    @field_validator('account_number')
    @classmethod
    def validate_account_number(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        if len(v) != 10:
            raise ValueError('Account number must be 10 digits')
        return v

    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: str) -> str:
        allowed = ['EUR', 'USD', 'GBP']
        if v.upper() not in allowed:
            raise ValueError(f'Currency must be one of {allowed}')
        return v.upper()

    @model_validator(mode='after')
    def check_balance(self) -> Self:
        if self.currency == 'EUR' and self.balance < 0:
            raise ValueError('EUR accounts cannot have negative balance')
        return self

# ✅ Validazione custom
account = BankAccount(
    account_number="1234567890",
    balance=1000.50,
    currency="eur"  # Convertito a EUR
)

# ❌ Account number non valido
try:
    BankAccount(account_number="12345", balance=100, currency="USD")
except Exception as e:
    print(e)
    # account_number: Account number must be 10 digits
```

### Validatori con Dipendenze tra Campi

```python
from pydantic import BaseModel, model_validator
from typing import Self
from datetime import datetime

class Event(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    max_participants: int
    registered: int = 0

    @model_validator(mode='after')
    def validate_dates(self) -> Self:
        if self.end_date <= self.start_date:
            raise ValueError('end_date must be after start_date')
        return self

    @model_validator(mode='after')
    def validate_participants(self) -> Self:
        if self.registered > self.max_participants:
            raise ValueError('registered cannot exceed max_participants')
        return self

# ✅ Validazione cross-field
event = Event(
    name="Python Conference",
    start_date="2025-12-15T09:00:00",
    end_date="2025-12-16T18:00:00",
    max_participants=100,
    registered=50
)

# ❌ Date invalide
try:
    Event(
        name="Workshop",
        start_date="2025-12-20T10:00:00",
        end_date="2025-12-19T10:00:00",  # Prima della start_date!
        max_participants=50
    )
except Exception as e:
    print(e)
    # end_date must be after start_date
```

## Nested Models: Strutture Complesse

```python
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Address(BaseModel):
    street: str
    city: str
    country: str
    postal_code: str

class ContactInfo(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    address: Address

class Employee(BaseModel):
    first_name: str
    last_name: str
    employee_id: int
    contact: ContactInfo
    skills: List[str]

# ✅ Validazione nested automatica
employee = Employee(
    first_name="Luca",
    last_name="Altimare",
    employee_id=12345,
    contact={
        "email": "luca@company.com",
        "phone": "+39 123 456 7890",
        "address": {
            "street": "Via Roma 1",
            "city": "Milano",
            "country": "Italy",
            "postal_code": "20100"
        }
    },
    skills=["Python", "Django", "FastAPI"]
)

# Accesso type-safe
print(employee.contact.address.city)  # Milano
print(employee.skills[0])  # Python
```

## Serializzazione e Deserializzazione

### Da JSON a Model e Viceversa

```python
from pydantic import BaseModel
from datetime import datetime

class Order(BaseModel):
    order_id: int
    customer_email: str
    total: float
    created_at: datetime

# ✅ Da dict/JSON a Model
order_data = {
    "order_id": 1001,
    "customer_email": "customer@example.com",
    "total": 299.99,
    "created_at": "2025-12-10T10:30:00"
}
order = Order(**order_data)

# ✅ Da Model a dict
print(order.model_dump())
# {
#     'order_id': 1001,
#     'customer_email': 'customer@example.com',
#     'total': 299.99,
#     'created_at': datetime(2025, 12, 10, 10, 30)
# }

# ✅ Da Model a JSON
print(order.model_dump_json())
# {"order_id":1001,"customer_email":"customer@example.com","total":299.99,"created_at":"2025-12-10T10:30:00"}

# ✅ Da JSON string a Model
json_str = '{"order_id":1002,"customer_email":"test@example.com","total":150.0,"created_at":"2025-12-10T11:00:00"}'
order2 = Order.model_validate_json(json_str)
```

### Escludere o Includere Campi

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    username: str
    email: str
    password: str = Field(exclude=True)  # Mai serializzato
    is_active: bool = True
    created_at: datetime

user = User(
    username="luca",
    email="luca@example.com",
    password="secret123",
    created_at="2025-12-10T10:00:00"
)

# ✅ Password esclusa automaticamente
print(user.model_dump())
# {
#     'username': 'luca',
#     'email': 'luca@example.com',
#     'is_active': True,
#     'created_at': datetime(...)
# }

# ✅ Esclusione dinamica
print(user.model_dump(exclude={'created_at'}))
# {'username': 'luca', 'email': 'luca@example.com', 'is_active': True}

# ✅ Solo campi specifici
print(user.model_dump(include={'username', 'email'}))
# {'username': 'luca', 'email': 'luca@example.com'}
```

## Casi d'Uso Reali

### 🌐 API Request/Response con FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import List

app = FastAPI()

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool = True

    class Config:
        from_attributes = True  # Per ORM models

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    # Validazione automatica grazie a Pydantic!
    # Se i dati non sono validi, FastAPI ritorna automaticamente 422

    # Simula creazione utente
    new_user = {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "is_active": True
    }

    return UserResponse(**new_user)

# Request automaticamente validata:
# POST /users
# {
#   "username": "luca",
#   "email": "luca@example.com",
#   "password": "securepass123"
# }
```

### 🗄️ Configurazione Applicazione

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    database_url: str
    redis_host: str = "localhost"
    redis_port: int = 6379
    secret_key: str
    max_connections: int = 100
    api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# ✅ Carica automaticamente da .env
settings = Settings()

# .env file:
# DATABASE_URL=postgresql://user:pass@localhost/db
# SECRET_KEY=super-secret-key-123
# DEBUG=true

print(settings.debug)  # True
print(settings.database_url)  # postgresql://user:pass@localhost/db
```

### 📊 Validazione Dati da File CSV/Excel

```python
from pydantic import BaseModel, field_validator
from typing import List
import csv

class ProductImport(BaseModel):
    sku: str
    name: str
    price: float
    quantity: int

    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v: str) -> str:
        if not v.startswith('PRD-'):
            raise ValueError('SKU must start with PRD-')
        return v.upper()

def import_products(csv_file: str) -> List[ProductImport]:
    products = []
    errors = []

    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            try:
                product = ProductImport(**row)
                products.append(product)
            except Exception as e:
                errors.append(f"Row {idx}: {e}")

    if errors:
        print("Validation Errors:")
        for error in errors:
            print(f"  - {error}")

    return products

# ✅ Importa e valida automaticamente
# products = import_products('products.csv')
```

### 🔄 Django Model → Pydantic Schema

```python
from django.db import models
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Django Model
class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# Pydantic Schema
class ArticleSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    published: bool
    created_at: datetime

# ✅ Conversione automatica
def get_article_api(article_id: int):
    article = Article.objects.get(id=article_id)
    return ArticleSchema.model_validate(article)

# Serializza automaticamente con tutti i tipi corretti
```

### 🤖 Validazione Response LLM/API Esterne

```python
from pydantic import BaseModel, Field
from typing import List, Literal
import openai

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class ChatCompletion(BaseModel):
    id: str
    model: str
    choices: List[dict]
    usage: dict

    @property
    def response_text(self) -> str:
        return self.choices[0]['message']['content']

def chat_with_validation(messages: List[ChatMessage]) -> str:
    # Validazione input
    validated_messages = [msg.model_dump() for msg in messages]

    # Chiamata API
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=validated_messages
    )

    # Validazione output
    validated_response = ChatCompletion(**response)
    return validated_response.response_text

# ✅ Type-safe LLM interactions
messages = [
    ChatMessage(role="system", content="You are a helpful assistant"),
    ChatMessage(role="user", content="Hello!")
]
result = chat_with_validation(messages)
```

## Performance e Best Practices

### ✅ 1. Usa model_validate per Validazione Esplicita

```python
# ❌ EVITA - Bypassa validazione se usi __init__ direttamente
user = User(email="test", age=-5)  # Può causare problemi

# ✅ MEGLIO - Validazione esplicita
user = User.model_validate({"email": "test@example.com", "age": 25})
```

### ✅ 2. Riutilizza Schemi con Ereditarietà

```python
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: int
    created_at: datetime
```

### ✅ 3. Usa ConfigDict per Ottimizzazioni

```python
from pydantic import BaseModel, ConfigDict

class OptimizedModel(BaseModel):
    model_config = ConfigDict(
        validate_assignment=True,  # Valida anche dopo la creazione
        frozen=True,  # Immutabile (performance migliori)
        str_strip_whitespace=True,  # Rimuove spazi automaticamente
        use_enum_values=True,  # Usa valori enum invece di oggetti
    )

    name: str
    age: int
```

### ✅ 4. Caching per Performance

```python
from functools import lru_cache

class Config(BaseModel):
    api_key: str
    max_retries: int = 3

@lru_cache()
def get_config() -> Config:
    # Carica config una volta sola
    return Config(api_key="secret", max_retries=5)

# Riutilizza la stessa istanza
config1 = get_config()
config2 = get_config()  # Stesso oggetto, no re-validazione
```

## Pydantic V2: Novità e Miglioramenti

### Performance Incredibili

Pydantic V2 (rilasciato nel 2023) è scritto in **Rust** ed è:
- **5-50x più veloce** della v1
- Usa meno memoria
- Migliore supporto per JSON Schema

### Nuove Feature

```python
from pydantic import BaseModel, computed_field, field_serializer
from typing import Annotated
from pydantic.functional_validators import AfterValidator

# ✅ Computed Fields
class User(BaseModel):
    first_name: str
    last_name: str

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

user = User(first_name="Luca", last_name="Altimare")
print(user.full_name)  # "Luca Altimare"
print(user.model_dump())  # Include 'full_name'

# ✅ Custom Serializers
class Product(BaseModel):
    name: str
    price: float

    @field_serializer('price')
    def serialize_price(self, value: float) -> str:
        return f"€{value:.2f}"

product = Product(name="Laptop", price=999.99)
print(product.model_dump())  # {'name': 'Laptop', 'price': '€999.99'}
```

## Errori Comuni da Evitare

### ❌ Errore 1: Non Gestire ValidationError

```python
from pydantic import ValidationError

# ❌ SBAGLIATO
def process_data(data: dict):
    user = User(**data)  # Può crashare l'app!

# ✅ CORRETTO
def process_data(data: dict):
    try:
        user = User(**data)
        return user
    except ValidationError as e:
        print(e.json())  # Log strutturato
        return None
```

### ❌ Errore 2: Mutare Oggetti Frozen

```python
from pydantic import BaseModel, ConfigDict

class ImmutableUser(BaseModel):
    model_config = ConfigDict(frozen=True)
    name: str

user = ImmutableUser(name="Luca")
# user.name = "Mario"  # ❌ Errore! Immutable

# ✅ Crea nuova istanza invece
updated_user = user.model_copy(update={"name": "Mario"})
```

### ❌ Errore 3: Validazione Troppo Permissiva

```python
# ❌ TROPPO PERMISSIVO
class BadUser(BaseModel):
    email: str  # Accetta qualsiasi stringa!

# ✅ CORRETTO
class GoodUser(BaseModel):
    email: EmailStr  # Solo email valide
```

## Confronto con Alternative

### **Pydantic**
- ✅ **Type hints nativi** - Usa Python standard
- ✅ **Performance** - Molto veloce (Rust core in v2)
- ✅ **FastAPI integration** - Perfetto per API
- ✅ **JSON Schema** - Generazione automatica
- ✅ **Documentazione** - Eccellente

### **Marshmallow**
- ⚠️ **Sintassi diversa** - Non usa type hints
- ⚠️ **Performance** - Più lento di Pydantic
- ✅ **Maturo** - Più vecchio, più esempi
- ✅ **Flask/SQLAlchemy** - Buona integrazione

### **attrs + validators**
- ✅ **Leggero** - Meno overhead
- ⚠️ **Validazione manuale** - Meno automatica
- ⚠️ **Serializzazione** - Limitata

## Conclusione: Perché Pydantic è Indispensabile

Pydantic non è solo una libreria di validazione: è un **cambio di paradigma** nello sviluppo Python.

**Vantaggi concreti:**
- 🚀 **Meno bug in production** - Validazione rigorosa
- ⚡ **Sviluppo più rapido** - Meno codice boilerplate
- 📊 **Type safety** - IDE autocomplete perfetto
- 🔒 **Sicurezza** - Validazione automatica input utente
- 📖 **Documentazione automatica** - Con FastAPI

**Quando usare Pydantic:**
- ✅ API con FastAPI (obbligatorio)
- ✅ Configurazione applicazioni
- ✅ Validazione dati da fonti esterne (API, CSV, form)
- ✅ Data parsing e trasformazione
- ✅ Serializzazione/deserializzazione JSON

**Il codice migliore è quello che non puoi scrivere male.**
Pydantic ti costringe a scrivere codice corretto fin dall'inizio.

## Risorse Utili

- [Pydantic Documentation](https://docs.pydantic.dev/)
- [FastAPI + Pydantic](https://fastapi.tiangolo.com/)
- [Pydantic V2 Migration Guide](https://docs.pydantic.dev/latest/migration/)
- [JSON Schema with Pydantic](https://docs.pydantic.dev/latest/concepts/json_schema/)

---

*Hai domande su come integrare Pydantic nel tuo progetto? Contattami per una consulenza!*
