---
title: "Architetture Software Moderne: Clean, Hexagonal, Onion - Guida Completa 2025"
date: "2025-12-13T10:00:00"
excerpt: "Guida definitiva alle architetture software scalabili: Clean Architecture, Hexagonal (Ports & Adapters), Onion e Layered. Scopri quando usare ciascuna, con esempi pratici in Python/Django."
category: "Backend"
author: "Luca Altimare"
---

# Architetture Software Moderne: Clean, Hexagonal, Onion - Guida Completa 2025

Quando la tua applicazione cresce, il codice spaghetti diventa il tuo peggior nemico. Le architetture software moderne risolvono questo problema separando le **responsabilità** e rendendo il codice **testabile, manutenibile e scalabile**.

In questo articolo esploreremo le quattro architetture più importanti del 2025.

## Il Problema: Monolite Accoppiato

### ❌ Architettura Tradizionale (Layered Semplice)

```python
# views.py - TUTTO MESCOLATO
from django.shortcuts import render
from django.db.models import Q
import stripe
import requests

def checkout(request):
    # Business logic nella view
    user = request.user
    cart = user.cart_items.all()

    # Chiamate esterne nella view
    total = sum(item.price for item in cart)

    # Payment direttamente nella view
    stripe.api_key = settings.STRIPE_KEY
    charge = stripe.Charge.create(
        amount=int(total * 100),
        currency='eur',
        source=request.POST['token']
    )

    # Email nella view
    send_mail(
        'Order Confirmation',
        f'Your order for {total}€',
        'from@example.com',
        [user.email]
    )

    # Database nella view
    Order.objects.create(
        user=user,
        total=total,
        stripe_id=charge.id
    )

    return render(request, 'success.html')
```

### Problemi:

1. **❌ Impossibile testare** - Troppe dipendenze esterne
2. **❌ Difficile cambiare** - Cambio payment provider = riscrivere view
3. **❌ Business logic nascosta** - Mescolata con framework
4. **❌ Accoppiamento** - View dipende da Stripe, SMTP, Django ORM

## Le 4 Architetture Moderne

### 📊 Confronto Rapido

**🏢 Layered Architecture (Tradizionale)**
- ✅ Facile da capire
- ✅ Veloce da implementare
- ❌ Accoppiamento verticale
- ❌ Difficile testare

**🧅 Onion Architecture**
- ✅ Domain al centro
- ✅ Dipendenze verso l'interno
- ⚠️ Curva apprendimento media
- ✅ Ottima per DDD

**⬡ Hexagonal Architecture (Ports & Adapters)**
- ✅ Isolamento totale
- ✅ Sostituibilità adapters
- ✅ Testing eccezionale
- ⚠️ Più boilerplate

**🎯 Clean Architecture**
- ✅ Completa e strutturata
- ✅ Framework-agnostic
- ✅ Enterprise-ready
- ⚠️ Complessa per piccoli progetti

## 1. Layered Architecture (Tradizionale)

### Struttura

```
┌─────────────────────────┐
│   Presentation Layer    │  ← UI, Controllers, Views
├─────────────────────────┤
│    Business Layer       │  ← Business Logic, Services
├─────────────────────────┤
│   Persistence Layer     │  ← Database, ORM, Repositories
├─────────────────────────┤
│      Database           │
└─────────────────────────┘
```

### Esempio Django

```python
# models.py (Persistence Layer)
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)

# services.py (Business Layer)
class OrderService:
    def create_order(self, user, items):
        total = sum(item.price * item.quantity for item in items)

        order = Order.objects.create(
            user=user,
            total=total,
            status='pending'
        )

        return order

# views.py (Presentation Layer)
def create_order_view(request):
    items = get_cart_items(request)
    service = OrderService()
    order = service.create_order(request.user, items)

    return render(request, 'order_created.html', {'order': order})
```

### ✅ Pro

- Semplice da capire e implementare
- Separazione chiara delle responsabilità
- Adatta per applicazioni piccole/medie

### ❌ Contro

- Dipendenze vanno sempre verso il basso
- Business layer accoppiato al database
- Difficile sostituire database o framework
- Testing richiede database reale

### 🎯 Quando Usarla

- Progetti piccoli/medi
- Team junior
- Prototipazione rapida
- CRUD semplici

## 2. Onion Architecture

### Struttura

```
        ┌─────────────────────┐
        │   Infrastructure    │  ← Framework, DB, API
        │   ┌─────────────┐   │
        │   │  Services   │   │  ← Application Services
        │   │  ┌───────┐  │   │
        │   │  │Domain │  │   │  ← Business Logic (CORE)
        │   │  └───────┘  │   │
        │   └─────────────┘   │
        └─────────────────────┘

        Dipendenze → verso il centro
```

### Principi Chiave

1. **Domain al centro** - Business logic pura
2. **Dipendenze verso l'interno** - Outer layers dipendono da inner
3. **Nessuna dipendenza esterna nel core** - Domain non conosce DB/Framework

### Esempio Pratico

```python
# domain/entities.py (CORE - Nessuna dipendenza)
from dataclasses import dataclass
from decimal import Decimal
from typing import List

@dataclass
class OrderItem:
    product_name: str
    price: Decimal
    quantity: int

    @property
    def subtotal(self) -> Decimal:
        return self.price * self.quantity

@dataclass
class Order:
    items: List[OrderItem]
    customer_email: str

    @property
    def total(self) -> Decimal:
        return sum(item.subtotal for item in self.items)

    def validate(self) -> bool:
        """Business rule: ordine minimo 10€"""
        return self.total >= Decimal('10.00')

    def apply_discount(self, percentage: Decimal):
        """Business logic pura"""
        discount = self.total * (percentage / 100)
        return self.total - discount

# domain/interfaces.py (CORE - Ports)
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> int:
        pass

    @abstractmethod
    def find_by_id(self, order_id: int) -> Order:
        pass

class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount: Decimal, token: str) -> str:
        pass

# application/services.py (Application Layer)
class OrderService:
    def __init__(
        self,
        order_repo: OrderRepository,
        payment_gateway: PaymentGateway
    ):
        self.order_repo = order_repo
        self.payment_gateway = payment_gateway

    def create_order(self, order: Order, payment_token: str) -> int:
        # Validazione domain
        if not order.validate():
            raise ValueError("Order minimum is 10€")

        # Payment
        transaction_id = self.payment_gateway.charge(
            order.total,
            payment_token
        )

        # Persistenza
        order_id = self.order_repo.save(order)

        return order_id

# infrastructure/repositories.py (Infrastructure Layer)
from domain.interfaces import OrderRepository
from domain.entities import Order

class DjangoOrderRepository(OrderRepository):
    """Adapter concreto per Django ORM"""

    def save(self, order: Order) -> int:
        from .models import OrderModel

        db_order = OrderModel.objects.create(
            customer_email=order.customer_email,
            total=order.total
        )

        return db_order.id

    def find_by_id(self, order_id: int) -> Order:
        from .models import OrderModel

        db_order = OrderModel.objects.get(id=order_id)

        # Conversione da DB model a Domain entity
        return Order(
            items=[],  # Ricostruisci items
            customer_email=db_order.customer_email
        )

# infrastructure/payment.py (Infrastructure Layer)
import stripe
from domain.interfaces import PaymentGateway

class StripePaymentGateway(PaymentGateway):
    """Adapter concreto per Stripe"""

    def __init__(self, api_key: str):
        stripe.api_key = api_key

    def charge(self, amount: Decimal, token: str) -> str:
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency='eur',
            source=token
        )
        return charge.id

# presentation/views.py (Presentation Layer)
from django.shortcuts import render
from application.services import OrderService
from infrastructure.repositories import DjangoOrderRepository
from infrastructure.payment import StripePaymentGateway

def checkout_view(request):
    # Dependency Injection
    order_service = OrderService(
        order_repo=DjangoOrderRepository(),
        payment_gateway=StripePaymentGateway(settings.STRIPE_KEY)
    )

    # Costruisci domain entity
    order = Order(
        items=get_cart_items(request),
        customer_email=request.user.email
    )

    # Use case
    order_id = order_service.create_order(
        order,
        request.POST['payment_token']
    )

    return render(request, 'success.html', {'order_id': order_id})
```

### ✅ Pro

- Business logic completamente isolata
- Facile testare domain senza DB
- Sostituire infrastruttura è semplice
- Ottima per Domain-Driven Design

### ❌ Contro

- Più file e boilerplate
- Conversione tra layers (entities ↔ models)
- Curva apprendimento più alta

### 🎯 Quando Usarla

- Business logic complessa
- Domain-Driven Design
- Necessità di cambiare infrastruttura
- Team medio/senior

## 3. Hexagonal Architecture (Ports & Adapters)

### Struttura

```
      ┌─────────────────────────────────┐
      │         Adapters (OUT)          │
      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
      │  │ DB │ │Mail│ │Pay │ │API │  │
      │  └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘  │
      │    │      │      │      │      │
      │    └──────┴──────┴──────┘      │
      │           ↓ Ports               │
      │  ┌──────────────────────────┐  │
      │  │   Application CORE       │  │
      │  │   (Business Logic)       │  │
      │  └──────────────────────────┘  │
      │           ↑ Ports               │
      │    ┌──────┴──────┬──────┐      │
      │    │      │      │      │      │
      │  ┌─┴──┐ ┌─┴──┐ ┌─┴──┐ ┌─┴──┐  │
      │  │Web │ │CLI │ │API │ │Test│  │
      │  └────┘ └────┘ └────┘ └────┘  │
      │         Adapters (IN)           │
      └─────────────────────────────────┘
```

### Concetti Chiave

- **Ports** = Interfacce (contracts)
- **Adapters** = Implementazioni concrete
- **Core** = Business logic isolata

### Esempio Completo

```python
# core/domain.py (Application Core)
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

@dataclass
class User:
    id: int
    email: str
    subscription_tier: str

    def can_create_projects(self, current_count: int) -> bool:
        """Business rule: limiti progetti per tier"""
        limits = {'free': 1, 'pro': 10, 'enterprise': 999}
        return current_count < limits.get(self.subscription_tier, 0)

# core/ports.py (Ports - Interfaces)
from typing import Protocol, Optional

class UserRepository(Protocol):
    """Port per persistenza User"""
    def save(self, user: User) -> int: ...
    def find_by_id(self, user_id: int) -> Optional[User]: ...
    def find_by_email(self, email: str) -> Optional[User]: ...

class EmailService(Protocol):
    """Port per invio email"""
    def send_welcome_email(self, email: str, name: str) -> bool: ...

class PaymentProcessor(Protocol):
    """Port per pagamenti"""
    def create_subscription(self, user_id: int, plan: str) -> str: ...

# core/use_cases.py (Application Core)
class RegisterUserUseCase:
    """Use case isolato - nessuna dipendenza concreta"""

    def __init__(
        self,
        user_repo: UserRepository,
        email_service: EmailService
    ):
        self.user_repo = user_repo
        self.email_service = email_service

    def execute(self, email: str, password: str) -> User:
        # Business validation
        existing = self.user_repo.find_by_email(email)
        if existing:
            raise ValueError("Email already registered")

        # Create user
        user = User(
            id=0,
            email=email,
            subscription_tier='free'
        )

        user_id = self.user_repo.save(user)
        user.id = user_id

        # Send welcome email
        self.email_service.send_welcome_email(email, email.split('@')[0])

        return user

# adapters/repositories.py (Adapter OUT - Database)
from core.ports import UserRepository
from core.domain import User
import psycopg2

class PostgresUserRepository:
    """Adapter concreto per PostgreSQL"""

    def __init__(self, connection_string: str):
        self.conn = psycopg2.connect(connection_string)

    def save(self, user: User) -> int:
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (email, subscription_tier) VALUES (%s, %s) RETURNING id",
                (user.email, user.subscription_tier)
            )
            user_id = cur.fetchone()[0]
            self.conn.commit()
            return user_id

    def find_by_id(self, user_id: int) -> Optional[User]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT id, email, subscription_tier FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if row:
                return User(id=row[0], email=row[1], subscription_tier=row[2])
        return None

    def find_by_email(self, email: str) -> Optional[User]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT id, email, subscription_tier FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            if row:
                return User(id=row[0], email=row[1], subscription_tier=row[2])
        return None

class DjangoORMUserRepository:
    """Adapter alternativo per Django ORM"""

    def save(self, user: User) -> int:
        from .models import UserModel
        db_user = UserModel.objects.create(
            email=user.email,
            subscription_tier=user.subscription_tier
        )
        return db_user.id

    def find_by_email(self, email: str) -> Optional[User]:
        from .models import UserModel
        try:
            db_user = UserModel.objects.get(email=email)
            return User(
                id=db_user.id,
                email=db_user.email,
                subscription_tier=db_user.subscription_tier
            )
        except UserModel.DoesNotExist:
            return None

# adapters/email.py (Adapter OUT - Email)
from core.ports import EmailService
import resend

class ResendEmailService:
    """Adapter concreto per Resend"""

    def __init__(self, api_key: str):
        resend.api_key = api_key

    def send_welcome_email(self, email: str, name: str) -> bool:
        params = {
            "from": "onboarding@example.com",
            "to": [email],
            "subject": f"Welcome {name}!",
            "html": f"<p>Welcome to our platform, {name}!</p>"
        }
        resend.Emails.send(params)
        return True

class ConsoleEmailService:
    """Adapter fake per testing"""

    def send_welcome_email(self, email: str, name: str) -> bool:
        print(f"[EMAIL] Welcome {name} at {email}")
        return True

# adapters/web.py (Adapter IN - HTTP)
from flask import Flask, request, jsonify
from core.use_cases import RegisterUserUseCase
from adapters.repositories import PostgresUserRepository
from adapters.email import ResendEmailService

app = Flask(__name__)

@app.route('/register', methods=['POST'])
def register():
    """Adapter IN - converte HTTP request in use case call"""

    # Dependency injection (in production: usa DI container)
    use_case = RegisterUserUseCase(
        user_repo=PostgresUserRepository(os.getenv('DATABASE_URL')),
        email_service=ResendEmailService(os.getenv('RESEND_KEY'))
    )

    # Execute use case
    try:
        user = use_case.execute(
            email=request.json['email'],
            password=request.json['password']
        )
        return jsonify({'user_id': user.id, 'email': user.email}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

# adapters/cli.py (Adapter IN - CLI)
import click
from core.use_cases import RegisterUserUseCase

@click.command()
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
def register_cli(email: str, password: str):
    """Adapter IN - CLI usa stesso use case"""

    use_case = RegisterUserUseCase(
        user_repo=PostgresUserRepository(os.getenv('DATABASE_URL')),
        email_service=ConsoleEmailService()  # Console per CLI
    )

    user = use_case.execute(email, password)
    click.echo(f"User {user.email} registered with ID {user.id}")
```

### Testing Facile

```python
# tests/test_register.py
from core.use_cases import RegisterUserUseCase
from core.domain import User

class FakeUserRepository:
    """Fake adapter per testing - no database needed!"""

    def __init__(self):
        self.users = {}
        self.next_id = 1

    def save(self, user: User) -> int:
        user_id = self.next_id
        self.users[user_id] = user
        self.next_id += 1
        return user_id

    def find_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

class FakeEmailService:
    """Fake adapter - traccia email inviate"""

    def __init__(self):
        self.emails_sent = []

    def send_welcome_email(self, email: str, name: str) -> bool:
        self.emails_sent.append((email, name))
        return True

def test_register_user():
    """Test use case senza dipendenze esterne!"""

    # Arrange
    user_repo = FakeUserRepository()
    email_service = FakeEmailService()
    use_case = RegisterUserUseCase(user_repo, email_service)

    # Act
    user = use_case.execute('test@example.com', 'password123')

    # Assert
    assert user.id == 1
    assert user.email == 'test@example.com'
    assert user.subscription_tier == 'free'
    assert len(email_service.emails_sent) == 1
    assert email_service.emails_sent[0][0] == 'test@example.com'

def test_duplicate_email_fails():
    """Test business rule validation"""

    user_repo = FakeUserRepository()
    email_service = FakeEmailService()
    use_case = RegisterUserUseCase(user_repo, email_service)

    # Primo utente
    use_case.execute('test@example.com', 'password123')

    # Duplicato deve fallire
    with pytest.raises(ValueError, match="Email already registered"):
        use_case.execute('test@example.com', 'password456')
```

### ✅ Pro

- **Isolamento totale** - Core non conosce framework/DB
- **Testing eccezionale** - Fake adapters facili
- **Sostituibilità** - Cambi DB/Email senza toccare core
- **Flessibilità** - Stessi use case per Web/CLI/API

### ❌ Contro

- Più boilerplate (ports + adapters)
- Conversione dati tra layers
- Dependency injection manuale (o serve container)

### 🎯 Quando Usarla

- Applicazioni enterprise
- Necessità di cambiare infrastruttura
- Testing critico
- Team senior

## 4. Clean Architecture (Uncle Bob)

### Struttura Completa

```
┌──────────────────────────────────────────┐
│         Frameworks & Drivers             │  ← Web, DB, UI
│  ┌────────────────────────────────────┐  │
│  │      Interface Adapters            │  │  ← Controllers, Presenters
│  │  ┌──────────────────────────────┐  │  │
│  │  │   Application Business Rules │  │  │  ← Use Cases
│  │  │  ┌────────────────────────┐  │  │  │
│  │  │  │  Enterprise Business   │  │  │  │  ← Entities (Domain)
│  │  │  │       Rules            │  │  │  │
│  │  │  └────────────────────────┘  │  │  │
│  │  └──────────────────────────────┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

Dependency Rule: → sempre verso l'interno
```

### I 4 Layer

**🎯 Entities (Centro)**
- Domain business rules
- Oggetti business puri
- Nessuna dipendenza

**📋 Use Cases**
- Application business rules
- Orchestrazione entities
- Input/Output interfaces

**🔌 Interface Adapters**
- Controllers
- Presenters
- Gateways

**🌐 Frameworks & Drivers**
- Web framework
- Database
- UI

### Esempio Completo E-commerce

```python
# entities/product.py (ENTITIES LAYER)
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass
class Product:
    """Entity - Business object puro"""
    id: int
    name: str
    price: Decimal
    stock: int

    def is_available(self, quantity: int = 1) -> bool:
        """Business rule: disponibilità"""
        return self.stock >= quantity

    def apply_discount(self, percentage: Decimal) -> Decimal:
        """Business rule: sconto"""
        if percentage < 0 or percentage > 100:
            raise ValueError("Invalid discount percentage")
        discount = self.price * (percentage / 100)
        return self.price - discount

@dataclass
class Cart:
    """Entity - Carrello"""
    items: list[tuple[Product, int]]  # (product, quantity)

    @property
    def total(self) -> Decimal:
        return sum(p.price * qty for p, qty in self.items)

    def add_product(self, product: Product, quantity: int):
        """Business rule: validazione aggiunta"""
        if not product.is_available(quantity):
            raise ValueError(f"Product {product.name} not available")
        self.items.append((product, quantity))

# use_cases/checkout.py (USE CASES LAYER)
from typing import Protocol
from entities.product import Cart

class OrderRepository(Protocol):
    """Port - interface per persistenza"""
    def save_order(self, cart: Cart, user_id: int) -> int: ...

class PaymentGateway(Protocol):
    """Port - interface per pagamento"""
    def charge(self, amount: Decimal, user_id: int) -> str: ...

class EmailNotifier(Protocol):
    """Port - interface per email"""
    def send_order_confirmation(self, user_id: int, order_id: int): ...

@dataclass
class CheckoutRequest:
    """Input boundary"""
    user_id: int
    cart: Cart

@dataclass
class CheckoutResponse:
    """Output boundary"""
    order_id: int
    transaction_id: str
    total: Decimal

class CheckoutUseCase:
    """Use case - application business logic"""

    def __init__(
        self,
        order_repo: OrderRepository,
        payment: PaymentGateway,
        email: EmailNotifier
    ):
        self.order_repo = order_repo
        self.payment = payment
        self.email = email

    def execute(self, request: CheckoutRequest) -> CheckoutResponse:
        # Validation
        if not request.cart.items:
            raise ValueError("Cart is empty")

        # Business rule: minimo ordine
        if request.cart.total < Decimal('10.00'):
            raise ValueError("Minimum order is 10€")

        # Process payment
        transaction_id = self.payment.charge(
            request.cart.total,
            request.user_id
        )

        # Save order
        order_id = self.order_repo.save_order(
            request.cart,
            request.user_id
        )

        # Send notification
        self.email.send_order_confirmation(
            request.user_id,
            order_id
        )

        return CheckoutResponse(
            order_id=order_id,
            transaction_id=transaction_id,
            total=request.cart.total
        )

# interface_adapters/controllers.py (INTERFACE ADAPTERS LAYER)
from flask import Flask, request, jsonify
from use_cases.checkout import CheckoutUseCase, CheckoutRequest
from entities.product import Cart, Product

class CheckoutController:
    """Controller - converte HTTP in use case"""

    def __init__(self, use_case: CheckoutUseCase):
        self.use_case = use_case

    def handle_request(self):
        """HTTP → Use Case"""
        try:
            # Parse HTTP request
            data = request.get_json()

            # Costruisci entities
            cart = Cart(items=[])
            for item in data['items']:
                product = Product(
                    id=item['product_id'],
                    name=item['name'],
                    price=Decimal(item['price']),
                    stock=999
                )
                cart.add_product(product, item['quantity'])

            # Costruisci input boundary
            checkout_request = CheckoutRequest(
                user_id=data['user_id'],
                cart=cart
            )

            # Execute use case
            response = self.use_case.execute(checkout_request)

            # Convert to HTTP response
            return jsonify({
                'order_id': response.order_id,
                'transaction_id': response.transaction_id,
                'total': str(response.total)
            }), 200

        except ValueError as e:
            return jsonify({'error': str(e)}), 400

# frameworks/web.py (FRAMEWORKS LAYER)
from flask import Flask
from interface_adapters.controllers import CheckoutController
from frameworks.database import SQLAlchemyOrderRepository
from frameworks.stripe_gateway import StripePaymentGateway
from frameworks.email import SendgridEmailNotifier

app = Flask(__name__)

# Dependency injection (in production: usa DI container)
def create_checkout_use_case():
    return CheckoutUseCase(
        order_repo=SQLAlchemyOrderRepository(),
        payment=StripePaymentGateway(api_key=os.getenv('STRIPE_KEY')),
        email=SendgridEmailNotifier(api_key=os.getenv('SENDGRID_KEY'))
    )

@app.route('/checkout', methods=['POST'])
def checkout():
    controller = CheckoutController(create_checkout_use_case())
    return controller.handle_request()

# frameworks/database.py (FRAMEWORKS LAYER)
from sqlalchemy import create_engine
from use_cases.checkout import OrderRepository

class SQLAlchemyOrderRepository:
    """Concrete adapter per SQLAlchemy"""

    def __init__(self):
        self.engine = create_engine(os.getenv('DATABASE_URL'))

    def save_order(self, cart: Cart, user_id: int) -> int:
        # Implementazione SQLAlchemy
        pass
```

### Dependency Injection Container

```python
# dependency_injection.py
from dependency_injector import containers, providers
from use_cases.checkout import CheckoutUseCase
from frameworks.database import SQLAlchemyOrderRepository
from frameworks.stripe_gateway import StripePaymentGateway

class Container(containers.DeclarativeContainer):
    """DI Container"""

    config = providers.Configuration()

    # Repositories
    order_repository = providers.Singleton(
        SQLAlchemyOrderRepository,
        connection_string=config.database_url
    )

    # Gateways
    payment_gateway = providers.Singleton(
        StripePaymentGateway,
        api_key=config.stripe_key
    )

    # Use cases
    checkout_use_case = providers.Factory(
        CheckoutUseCase,
        order_repo=order_repository,
        payment=payment_gateway
    )

# Uso
container = Container()
container.config.from_dict({
    'database_url': os.getenv('DATABASE_URL'),
    'stripe_key': os.getenv('STRIPE_KEY')
})

checkout = container.checkout_use_case()
```

### ✅ Pro

- **Struttura completa** - Guidelines chiare
- **Testabilità massima** - Fake su ogni layer
- **Framework-agnostic** - Core non conosce Django/Flask
- **Enterprise-ready** - Scalabile a qualsiasi dimensione

### ❌ Contro

- **Complessa** - Overkill per piccoli progetti
- **Boilerplate** - Molti file e interfaces
- **Curva apprendimento** - Richiede team senior
- **DI Container** - Necessario per progetti grandi

### 🎯 Quando Usarla

- Applicazioni enterprise
- Team grandi (10+ developers)
- Business logic molto complessa
- Necessità massima flessibilità

## Confronto Diretto: Quale Scegliere?

### 📊 Scenario: API E-commerce

**🏢 Layered Architecture**
```python
# Tutto in un posto - semplice ma accoppiato
def checkout(request):
    order = Order.objects.create(...)  # Accoppiato a Django
    stripe.Charge.create(...)  # Accoppiato a Stripe
    send_mail(...)  # Accoppiato a SMTP
```

**✅ Veloce da scrivere**
**❌ Impossibile testare senza DB/Stripe**

---

**🧅 Onion Architecture**
```python
# Domain al centro
class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo  # Interface, non implementazione

    def create_order(self, order: Order):
        # Business logic pura
        if order.total < 10:
            raise ValueError("Minimum 10€")
        return self.repo.save(order)
```

**✅ Business logic isolata**
**✅ Facile testare con fake repo**

---

**⬡ Hexagonal Architecture**
```python
# Ports & Adapters espliciti
class RegisterUserUseCase:
    def __init__(self, user_repo: UserRepository, email: EmailService):
        self.user_repo = user_repo
        self.email = email

# Sostituire adapters è triviale
PostgresAdapter()  # Production
FakeAdapter()      # Testing
```

**✅ Massima sostituibilità**
**✅ Testing eccezionale**

---

**🎯 Clean Architecture**
```python
# Struttura completa con boundaries
@dataclass
class CheckoutRequest:  # Input boundary
    user_id: int
    cart: Cart

@dataclass
class CheckoutResponse:  # Output boundary
    order_id: int

class CheckoutUseCase:
    def execute(self, req: CheckoutRequest) -> CheckoutResponse:
        # Use case isolato
        ...
```

**✅ Struttura enterprise**
**❌ Molto boilerplate**

## Decision Matrix: Quale Usare?

### 🎯 **Usa Layered se:**

- Progetto piccolo (< 10k righe)
- Team junior
- Prototipo/MVP
- CRUD semplice
- Scadenze strette

**Esempio:** Blog, Dashboard interna, Admin panel

---

### 🧅 **Usa Onion se:**

- Business logic complessa
- Domain-Driven Design
- Team medio/senior
- Necessità testare business logic
- Progetto medio (10k-50k righe)

**Esempio:** Sistema gestionale, Platform SaaS, Fintech

---

### ⬡ **Usa Hexagonal se:**

- Necessità cambiare infrastruttura
- Testing prioritario
- Integrazione multi-channel (Web+CLI+API)
- Team senior
- Progetto medio-grande (20k-100k righe)

**Esempio:** Multi-tenant SaaS, API Gateway, Platform as a Service

---

### 🎯 **Usa Clean se:**

- Applicazione enterprise
- Team grande (10+ devs)
- Complessità massima
- Long-term maintenance (5+ anni)
- Progetto grande (100k+ righe)

**Esempio:** Banking system, Healthcare platform, ERP

## Migration Path: Come Migrare

### Da Layered a Onion (Step-by-step)

```python
# PRIMA (Layered)
# views.py
def create_order(request):
    order = Order.objects.create(...)
    stripe.Charge.create(...)
    send_mail(...)

# STEP 1: Estrai service layer
class OrderService:
    def create_order(self, data):
        order = Order.objects.create(...)
        stripe.Charge.create(...)
        send_mail(...)

# STEP 2: Introduci interfaces
class OrderRepository(ABC):
    @abstractmethod
    def save(self, order): ...

# STEP 3: Crea domain entities
@dataclass
class Order:
    items: List[OrderItem]

    @property
    def total(self):
        return sum(i.price for i in self.items)

# STEP 4: Use case con DI
class OrderService:
    def __init__(self, repo: OrderRepository, payment: PaymentGateway):
        self.repo = repo
        self.payment = payment
```

## Best Practices Trasversali

### ✅ **1. Dependency Rule**

```python
# ✅ CORRETTO - Dipendenze verso l'interno
from core.entities import Order  # OK
from infrastructure.database import PostgresRepo  # OK in infrastructure

# ❌ SBAGLIATO - Core dipende da infrastructure
# core/entities.py
from infrastructure.database import PostgresRepo  # WRONG!
```

### ✅ **2. Interfaces su Tutto**

```python
# ✅ CORRETTO
class PaymentGateway(Protocol):
    def charge(self, amount: Decimal) -> str: ...

class StripeGateway:  # Implementazione concreta
    def charge(self, amount: Decimal) -> str:
        return stripe.Charge.create(...)

# ❌ SBAGLIATO - Usare direttamente implementazione
def checkout(amount):
    stripe.Charge.create(...)  # Accoppiato!
```

### ✅ **3. Input/Output Boundaries**

```python
# ✅ CORRETTO - Boundaries espliciti
@dataclass
class CreateUserRequest:
    email: str
    password: str

@dataclass
class CreateUserResponse:
    user_id: int
    email: str

# ❌ SBAGLIATO - Usare dict/request direttamente
def create_user(request_data: dict):  # Accoppiato a HTTP!
```

### ✅ **4. Testing Pyramid**

```
        ┌──────┐
        │  E2E │  ← 10% - Slow, fragile
        ├──────┤
        │Integration│  ← 30% - Medium speed
        ├────────────┤
        │    Unit    │  ← 60% - Fast, focused
        └────────────┘
```

```python
# Unit test (veloce - no DB)
def test_order_total():
    order = Order(items=[...])
    assert order.total == Decimal('50.00')

# Integration test (medio - fake adapters)
def test_checkout_use_case():
    use_case = CheckoutUseCase(
        order_repo=FakeOrderRepository(),
        payment=FakePaymentGateway()
    )
    response = use_case.execute(request)
    assert response.order_id == 1

# E2E test (lento - tutto reale)
def test_checkout_api(client):
    response = client.post('/checkout', json={...})
    assert response.status_code == 200
```

## Conclusione: Scegli con Saggezza

**Non esiste "la migliore architettura"** - esiste quella giusta per il tuo contesto.

### Regola d'oro:

- **Piccolo progetto?** → Layered
- **Business logic complessa?** → Onion
- **Sostituibilità critica?** → Hexagonal
- **Enterprise long-term?** → Clean

**Inizia semplice e refactora quando necessario.**

Un'architettura è come un vestito: deve calzare bene al progetto, non essere la più bella della vetrina.

## Risorse Utili

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Onion Architecture (Jeffrey Palermo)](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
- [DDD (Eric Evans)](https://www.domainlanguage.com/)

---

*Hai dubbi su quale architettura scegliere per il tuo progetto? Contattami per una consulenza!*
