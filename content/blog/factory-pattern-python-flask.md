---
title: "Factory Pattern in Python: Guida Completa con Esempi Flask Pratici"
date: "2025-12-12T10:00:00"
excerpt: "Scopri cos'è il Factory Pattern, perché è fondamentale per applicazioni scalabili e come implementarlo in Python con Flask. Include repository di esempio completa con factory per models, configs e testing."
category: "Backend"
author: "Luca Altimare"
---

# Factory Pattern in Python: Guida Completa con Esempi Flask Pratici

Il **Factory Pattern** è uno dei design pattern più utilizzati nello sviluppo software. Se hai mai usato Flask, Django o SQLAlchemy, hai già usato factory senza saperlo. Vediamo cos'è, perché serve e come implementarlo correttamente.

## Cos'è il Factory Pattern?

Il Factory Pattern è un **creational pattern** che fornisce un'interfaccia per creare oggetti senza specificare la classe esatta dell'oggetto che verrà creato.

### Il Problema Senza Factory

```python
# ❌ SENZA Factory - Codice rigido e difficile da testare
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import ProductionConfig

# Creazione diretta con configurazione hardcoded
app = Flask(__name__)
app.config.from_object(ProductionConfig)
db = SQLAlchemy(app)

# Problemi:
# 1. Impossibile testare con config diverse
# 2. Dipendenze hardcoded
# 3. Non riutilizzabile
# 4. Difficile cambiare configurazione
```

### La Soluzione con Factory

```python
# ✅ CON Factory - Flessibile e testabile
def create_app(config_name='development'):
    """Factory per creare istanze Flask configurabili"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    mail.init_app(app)

    register_blueprints(app)
    register_extensions(app)

    return app

# Uso flessibile
app_dev = create_app('development')
app_test = create_app('testing')
app_prod = create_app('production')
```

## Tipi di Factory Pattern

### 🏭 Simple Factory

La forma più semplice: una funzione che crea oggetti.

```python
# Simple Factory per creazione utenti
from enum import Enum
from dataclasses import dataclass

class UserRole(Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

@dataclass
class User:
    username: str
    email: str
    role: UserRole
    permissions: list[str]

def create_user(username: str, email: str, role: str) -> User:
    """Factory semplice per creare utenti con permessi predefiniti"""

    permission_map = {
        'admin': ['read', 'write', 'delete', 'manage_users'],
        'editor': ['read', 'write', 'delete'],
        'viewer': ['read']
    }

    return User(
        username=username,
        email=email,
        role=UserRole(role),
        permissions=permission_map.get(role, ['read'])
    )

# ✅ Uso
admin = create_user('luca', 'luca@example.com', 'admin')
print(admin.permissions)  # ['read', 'write', 'delete', 'manage_users']

viewer = create_user('guest', 'guest@example.com', 'viewer')
print(viewer.permissions)  # ['read']
```

### 🏗️ Factory Method

Una classe con metodo factory che può essere overridden.

```python
from abc import ABC, abstractmethod

# Abstract Products
class Database(ABC):
    @abstractmethod
    def connect(self) -> str:
        pass

    @abstractmethod
    def query(self, sql: str) -> list:
        pass

class PostgresDatabase(Database):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def connect(self) -> str:
        return f"Connected to PostgreSQL: {self.connection_string}"

    def query(self, sql: str) -> list:
        return [f"PostgreSQL result for: {sql}"]

class MySQLDatabase(Database):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def connect(self) -> str:
        return f"Connected to MySQL: {self.connection_string}"

    def query(self, sql: str) -> list:
        return [f"MySQL result for: {sql}"]

# Factory Method
class DatabaseFactory(ABC):
    @abstractmethod
    def create_database(self, connection_string: str) -> Database:
        pass

class PostgresFactory(DatabaseFactory):
    def create_database(self, connection_string: str) -> Database:
        return PostgresDatabase(connection_string)

class MySQLFactory(DatabaseFactory):
    def create_database(self, connection_string: str) -> Database:
        return MySQLDatabase(connection_string)

# ✅ Uso
def setup_database(factory: DatabaseFactory, conn_str: str):
    db = factory.create_database(conn_str)
    print(db.connect())
    results = db.query("SELECT * FROM users")
    return results

# Configurazione flessibile
pg_factory = PostgresFactory()
setup_database(pg_factory, "postgresql://localhost/mydb")

mysql_factory = MySQLFactory()
setup_database(mysql_factory, "mysql://localhost/mydb")
```

### 🏢 Abstract Factory

Factory di factory per creare famiglie di oggetti correlati.

```python
from abc import ABC, abstractmethod

# Abstract Products
class Button(ABC):
    @abstractmethod
    def render(self) -> str:
        pass

class Input(ABC):
    @abstractmethod
    def render(self) -> str:
        pass

# Concrete Products - Dark Theme
class DarkButton(Button):
    def render(self) -> str:
        return "<button class='dark-btn'>Click me</button>"

class DarkInput(Input):
    def render(self) -> str:
        return "<input class='dark-input' />"

# Concrete Products - Light Theme
class LightButton(Button):
    def render(self) -> str:
        return "<button class='light-btn'>Click me</button>"

class LightInput(Input):
    def render(self) -> str:
        return "<input class='light-input' />"

# Abstract Factory
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button:
        pass

    @abstractmethod
    def create_input(self) -> Input:
        pass

# Concrete Factories
class DarkThemeFactory(UIFactory):
    def create_button(self) -> Button:
        return DarkButton()

    def create_input(self) -> Input:
        return DarkInput()

class LightThemeFactory(UIFactory):
    def create_button(self) -> Button:
        return LightButton()

    def create_input(self) -> Input:
        return LightInput()

# ✅ Uso
def render_form(factory: UIFactory):
    button = factory.create_button()
    input_field = factory.create_input()

    return f"""
    <form>
        {input_field.render()}
        {button.render()}
    </form>
    """

# Cambi tema facilmente
dark_ui = DarkThemeFactory()
print(render_form(dark_ui))

light_ui = LightThemeFactory()
print(render_form(light_ui))
```

## Application Factory in Flask

### ✅ Struttura Completa Flask con Factory

```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_mail import Mail
from config import config

# Inizializza estensioni (senza app)
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app(config_name='development'):
    """
    Application Factory per Flask

    Args:
        config_name: Nome della configurazione ('development', 'testing', 'production')

    Returns:
        Istanza Flask configurata
    """
    app = Flask(__name__)

    # Carica configurazione
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Inizializza estensioni con app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    mail.init_app(app)

    # Registra blueprints
    from app.main import main_bp
    from app.auth import auth_bp
    from app.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    # Registra error handlers
    register_error_handlers(app)

    # Registra CLI commands
    register_commands(app)

    return app

def register_error_handlers(app):
    """Registra custom error handlers"""
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500

def register_commands(app):
    """Registra custom CLI commands"""
    @app.cli.command()
    def init_db():
        """Initialize the database"""
        db.create_all()
        print('Database initialized')
```

### Config Factory

```python
# config.py
import os
from datetime import timedelta

class Config:
    """Configurazione base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))

    @staticmethod
    def init_app(app):
        """Hook per inizializzazione custom"""
        pass

class DevelopmentConfig(Config):
    """Configurazione sviluppo"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///dev.db'
    SQLALCHEMY_ECHO = True  # Log SQL queries

class TestingConfig(Config):
    """Configurazione testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Configurazione production"""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

    @staticmethod
    def init_app(app):
        """Setup specifico per production"""
        # Log to syslog
        import logging
        from logging.handlers import SysLogHandler
        syslog_handler = SysLogHandler()
        syslog_handler.setLevel(logging.WARNING)
        app.logger.addHandler(syslog_handler)

# Factory per configs
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

### Entry Point

```python
# run.py
import os
from app import create_app, db
from app.models import User, Post

# Crea app con config da environment variable
config_name = os.environ.get('FLASK_CONFIG', 'development')
app = create_app(config_name)

@app.shell_context_processor
def make_shell_context():
    """Rende disponibili oggetti in flask shell"""
    return {'db': db, 'User': User, 'Post': Post}

if __name__ == '__main__':
    app.run()
```

## Factory per Testing

### ✅ Test Factory con pytest

```python
# tests/conftest.py
import pytest
from app import create_app, db
from app.models import User, Post

@pytest.fixture(scope='session')
def app():
    """Crea app per testing"""
    app = create_app('testing')

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Client per test HTTP"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """CLI runner per test comandi"""
    return app.test_cli_runner()

# Factory per creare dati di test
class UserFactory:
    """Factory per creare utenti di test"""

    @staticmethod
    def create(username='testuser', email='test@example.com', **kwargs):
        user = User(username=username, email=email)
        for key, value in kwargs.items():
            setattr(user, key, value)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def create_batch(count=5):
        users = []
        for i in range(count):
            user = UserFactory.create(
                username=f'user{i}',
                email=f'user{i}@example.com'
            )
            users.append(user)
        return users

class PostFactory:
    """Factory per creare post di test"""

    @staticmethod
    def create(title='Test Post', author=None, **kwargs):
        if author is None:
            author = UserFactory.create()

        post = Post(title=title, author=author)
        for key, value in kwargs.items():
            setattr(post, key, value)
        db.session.add(post)
        db.session.commit()
        return post

# tests/test_users.py
def test_user_creation(app):
    """Test creazione utente con factory"""
    with app.app_context():
        user = UserFactory.create(username='luca')
        assert user.username == 'luca'
        assert user.email == 'test@example.com'

def test_multiple_users(app):
    """Test creazione batch utenti"""
    with app.app_context():
        users = UserFactory.create_batch(10)
        assert len(users) == 10
        assert all(u.email for u in users)
```

## Factory per Dependency Injection

### ✅ Service Factory

```python
# app/services.py
from abc import ABC, abstractmethod

class EmailService(ABC):
    """Interfaccia per servizi email"""

    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> bool:
        pass

class SMTPEmailService(EmailService):
    """Implementazione reale con SMTP"""

    def __init__(self, server: str, port: int):
        self.server = server
        self.port = port

    def send(self, to: str, subject: str, body: str) -> bool:
        # Logica SMTP reale
        print(f"Sending email via SMTP to {to}")
        return True

class ConsoleEmailService(EmailService):
    """Implementazione fake per sviluppo"""

    def send(self, to: str, subject: str, body: str) -> bool:
        print(f"[CONSOLE EMAIL] To: {to}\nSubject: {subject}\n{body}")
        return True

class ServiceFactory:
    """Factory per creare servizi"""

    @staticmethod
    def create_email_service(config_name: str) -> EmailService:
        if config_name == 'production':
            return SMTPEmailService('smtp.gmail.com', 587)
        else:
            return ConsoleEmailService()

# app/routes.py
from flask import current_app
from app.services import ServiceFactory

def send_welcome_email(user):
    """Invia email di benvenuto usando factory"""
    email_service = ServiceFactory.create_email_service(
        current_app.config['ENV']
    )

    return email_service.send(
        to=user.email,
        subject='Welcome!',
        body=f'Hello {user.username}!'
    )
```

## Factory con FactoryBoy (Advanced)

### ✅ Testing Avanzato con FactoryBoy

```python
# requirements.txt
# factory-boy==3.3.0

# tests/factories.py
import factory
from factory.alchemy import SQLAlchemyModelFactory
from app import db
from app.models import User, Post, Comment

class UserFactory(SQLAlchemyModelFactory):
    """Factory avanzato per User con FactoryBoy"""

    class Meta:
        model = User
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'commit'

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password_hash = factory.PostGenerationMethodCall('set_password', 'password')
    is_active = True
    created_at = factory.Faker('date_time_this_year')

class PostFactory(SQLAlchemyModelFactory):
    """Factory per Post"""

    class Meta:
        model = Post
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'commit'

    title = factory.Faker('sentence', nb_words=6)
    content = factory.Faker('text', max_nb_chars=500)
    author = factory.SubFactory(UserFactory)
    published = True
    created_at = factory.Faker('date_time_this_month')

class CommentFactory(SQLAlchemyModelFactory):
    """Factory per Comment"""

    class Meta:
        model = Comment
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'commit'

    text = factory.Faker('paragraph')
    post = factory.SubFactory(PostFactory)
    author = factory.SubFactory(UserFactory)

# ✅ Uso nei test
def test_user_with_posts():
    # Crea user con 3 post
    user = UserFactory.create()
    posts = PostFactory.create_batch(3, author=user)

    assert user.posts.count() == 3
    assert all(p.author == user for p in posts)

def test_post_with_comments():
    # Crea post con 5 commenti
    post = PostFactory.create()
    comments = CommentFactory.create_batch(5, post=post)

    assert post.comments.count() == 5
    assert all(c.post == post for c in comments)

def test_realistic_scenario():
    # Scenario completo
    authors = UserFactory.create_batch(3)
    for author in authors:
        posts = PostFactory.create_batch(2, author=author)
        for post in posts:
            CommentFactory.create_batch(3, post=post)

    # Verifica
    assert User.query.count() == 3
    assert Post.query.count() == 6
    assert Comment.query.count() == 18
```

## Casi d'Uso Reali

### 🔧 Factory per Parser di File

```python
from abc import ABC, abstractmethod
import json
import csv
import yaml

class FileParser(ABC):
    @abstractmethod
    def parse(self, file_path: str) -> dict:
        pass

class JSONParser(FileParser):
    def parse(self, file_path: str) -> dict:
        with open(file_path, 'r') as f:
            return json.load(f)

class CSVParser(FileParser):
    def parse(self, file_path: str) -> dict:
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            return {'data': list(reader)}

class YAMLParser(FileParser):
    def parse(self, file_path: str) -> dict:
        with open(file_path, 'r') as f:
            return yaml.safe_load(f)

class ParserFactory:
    """Factory per creare parser basato su estensione"""

    _parsers = {
        '.json': JSONParser,
        '.csv': CSVParser,
        '.yaml': YAMLParser,
        '.yml': YAMLParser,
    }

    @classmethod
    def create_parser(cls, file_path: str) -> FileParser:
        ext = file_path[file_path.rfind('.'):]
        parser_class = cls._parsers.get(ext)

        if parser_class is None:
            raise ValueError(f'Unsupported file type: {ext}')

        return parser_class()

# ✅ Uso automatico
def load_config(file_path: str) -> dict:
    parser = ParserFactory.create_parser(file_path)
    return parser.parse(file_path)

config = load_config('config.json')  # Usa JSONParser
config = load_config('data.csv')     # Usa CSVParser
config = load_config('settings.yaml') # Usa YAMLParser
```

### 🤖 Factory per LLM Clients

```python
from abc import ABC, abstractmethod
from typing import List, Dict

class LLMClient(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        pass

class OpenAIClient(LLMClient):
    def __init__(self, api_key: str, model: str = 'gpt-4'):
        self.api_key = api_key
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        # Chiamata OpenAI API
        return f"OpenAI response for: {prompt}"

class AnthropicClient(LLMClient):
    def __init__(self, api_key: str, model: str = 'claude-3'):
        self.api_key = api_key
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        # Chiamata Anthropic API
        return f"Claude response for: {prompt}"

class LocalLLMClient(LLMClient):
    def __init__(self, model_path: str):
        self.model_path = model_path

    def generate(self, prompt: str, **kwargs) -> str:
        # Chiamata modello locale
        return f"Local model response for: {prompt}"

class LLMFactory:
    """Factory per creare client LLM"""

    @staticmethod
    def create_client(provider: str, **kwargs) -> LLMClient:
        providers = {
            'openai': OpenAIClient,
            'anthropic': AnthropicClient,
            'local': LocalLLMClient,
        }

        client_class = providers.get(provider.lower())
        if client_class is None:
            raise ValueError(f'Unknown provider: {provider}')

        return client_class(**kwargs)

# ✅ Uso flessibile
def generate_text(prompt: str, provider: str = 'openai'):
    client = LLMFactory.create_client(
        provider,
        api_key=os.getenv(f'{provider.upper()}_API_KEY')
    )
    return client.generate(prompt)

# Cambi provider facilmente
response1 = generate_text("Hello", provider='openai')
response2 = generate_text("Hello", provider='anthropic')
response3 = generate_text("Hello", provider='local')
```

## Best Practices

### ✅ DO: Fai Questo

**1. Usa Factory per Configurazioni Multiple**
```python
app_dev = create_app('development')
app_test = create_app('testing')
```

**2. Inizializza Estensioni Lazy**
```python
db = SQLAlchemy()
# Poi in factory
db.init_app(app)
```

**3. Parametrizza le Factory**
```python
def create_user(role='viewer', **kwargs):
    # Flessibile
```

**4. Usa Type Hints**
```python
def create_app(config_name: str) -> Flask:
```

**5. Documenta le Factory**
```python
def create_app(config_name='development'):
    """
    Application Factory per Flask

    Args:
        config_name: 'development', 'testing', 'production'
    """
```

### ❌ DON'T: Non Fare Questo

**1. Non Hardcodare Dipendenze**
```python
# ❌ NO
app = Flask(__name__)
app.config.from_object(ProductionConfig)
```

**2. Non Creare Istanze Globali Direttamente**
```python
# ❌ NO
db = SQLAlchemy(app)  # app non esiste ancora!
```

**3. Non Fare Factory Troppo Complicate**
```python
# ❌ NO - Troppo complicato
def create_app(config, debug, db_url, mail, cache, ...):
```

**4. Non Dimenticare di Gestire Errori**
```python
# ❌ NO
def create_parser(ext):
    return parsers[ext]  # KeyError se ext non esiste!
```

## Quando Usare Factory Pattern

### ✅ Usa Factory Quando:

- 🔧 **Hai configurazioni multiple** (dev, test, prod)
- 🧪 **Devi scrivere test** con setup diversi
- 🔌 **Hai dipendenze da iniettare** (DB, services, API clients)
- 📦 **Crei oggetti complessi** con molti parametri
- 🔄 **Vuoi sostituire implementazioni** (mock in test)
- 📚 **Sviluppi librerie** usate da altri

### ❌ Non Usare Factory Quando:

- 🎯 **Oggetto semplice** con 1-2 parametri
- 🏃 **Script one-off** che gira una volta
- 🔒 **Singleton richiesto** (usa Singleton pattern)
- 📊 **Overhead non giustificato** per casi semplici

## Repository di Esempio

Ho preparato una **repository completa** con esempi pratici:

**📦 Struttura:**
```
flask-factory-example/
├── app/
│   ├── __init__.py          # Application Factory
│   ├── models.py            # SQLAlchemy Models
│   ├── services.py          # Service Factory
│   ├── main/                # Main Blueprint
│   ├── auth/                # Auth Blueprint
│   └── api/                 # API Blueprint
├── tests/
│   ├── conftest.py          # Test Fixtures
│   ├── factories.py         # Test Factories
│   └── test_app.py          # Tests
├── config.py                # Config Factory
├── run.py                   # Entry point
└── requirements.txt
```

**🚀 Clone e Usa:**
```bash
git clone https://github.com/MrHighSea/flask-factory-example
cd flask-factory-example
pip install -r requirements.txt
flask run
```

Link repository: **[github.com/MrHighSea/flask-factory-example](https://github.com/MrHighSea/flask-factory-example)**

## Conclusione

Il Factory Pattern non è solo un design pattern accademico: è uno strumento **pratico e quotidiano** per scrivere codice Python professionale.

**Vantaggi concreti:**
- 🧪 **Testing facile** - Config e dipendenze mockabili
- 🔧 **Flessibilità** - Cambi implementazione senza toccare codice
- 📦 **Riutilizzo** - Factory usabile ovunque
- 🎯 **Separation of Concerns** - Creazione separata da uso
- ⚡ **Lazy Initialization** - Crei solo quando serve

**Ricorda:**
> Non creare oggetti direttamente dove li usi.
> Delega la creazione a una Factory.
> Il tuo codice sarà più flessibile e testabile.

## Risorse Utili

- [Flask Application Factories](https://flask.palletsprojects.com/patterns/appfactories/)
- [Factory Boy Documentation](https://factoryboy.readthedocs.io/)
- [Python Design Patterns](https://refactoring.guru/design-patterns/factory-method/python)
- [Repository Esempio](https://github.com/lradev/flask-factory-example)

---

*Vuoi imparare altri design pattern Python? Seguimi per nuovi articoli!*
