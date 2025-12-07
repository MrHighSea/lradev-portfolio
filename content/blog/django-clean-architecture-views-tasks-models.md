---
title: "Django Clean Code: Perché le Query NON Vanno in Views e Tasks"
date: "2025-12-11T10:00:00"
excerpt: "Guida definitiva all'architettura pulita in Django: scopri perché views.py e tasks.py devono essere leggeri e come spostare la logica di business nei models con custom managers e metodi dedicati."
category: "Backend"
author: "Luca Altimare"
---

# Django Clean Code: Perché le Query NON Vanno in Views e Tasks

Uno degli errori più comuni nello sviluppo Django è scrivere query complesse direttamente in `views.py` e `tasks.py`. Questo porta a codice duplicato, difficile da testare e impossibile da mantenere. Vediamo come fare meglio.

## Il Problema: Fat Views, Thin Models

### ❌ Il Codice che Tutti Scrivono (e che Non Dovresti Scrivere)

```python
# views.py - ANTI-PATTERN
from django.shortcuts import render
from django.db.models import Count, Q
from .models import Article, User

def dashboard_view(request):
    # Query complessa direttamente nella view
    published_articles = Article.objects.filter(
        status='published',
        published_date__isnull=False
    ).select_related('author').prefetch_related('tags').annotate(
        comment_count=Count('comments')
    ).order_by('-published_date')[:10]

    # Altra logica business nella view
    active_users = User.objects.filter(
        is_active=True,
        last_login__gte=timezone.now() - timedelta(days=30)
    ).annotate(
        article_count=Count('article')
    ).filter(article_count__gt=0)

    # Calcoli complessi nella view
    trending_articles = Article.objects.filter(
        published_date__gte=timezone.now() - timedelta(days=7),
        status='published'
    ).annotate(
        score=Count('comments') + Count('likes') * 2
    ).order_by('-score')[:5]

    return render(request, 'dashboard.html', {
        'published_articles': published_articles,
        'active_users': active_users,
        'trending_articles': trending_articles,
    })
```

### Cosa c'è di Sbagliato?

1. **❌ Duplicazione** - Stessa query in view, task, test, API
2. **❌ Difficile da testare** - Logica mischiata con HTTP
3. **❌ Impossibile da riutilizzare** - Query copiate ovunque
4. **❌ Difficile da leggere** - Views di 200+ righe
5. **❌ Violazione SRP** - View fa troppo (HTTP + business logic + DB)

## La Soluzione: Fat Models, Thin Views

### ✅ Architettura Corretta

```
┌─────────────────────────────────────┐
│         Views / Tasks               │  ← Orchestrazione
│    (HTTP, Celery, Coordinamento)    │
└─────────────────┬───────────────────┘
                  │ chiama
                  ▼
┌─────────────────────────────────────┐
│           Models Layer              │  ← Business Logic
│  (Managers, QuerySets, Metodi)      │
└─────────────────┬───────────────────┘
                  │ interroga
                  ▼
┌─────────────────────────────────────┐
│            Database                 │
└─────────────────────────────────────┘
```

## Custom Managers: Il Cuore della Logica Business

### Cos'è un Manager?

Un **Manager** è la classe che gestisce le query per un modello Django. Ogni modello ha un manager di default chiamato `objects`.

```python
# Questo è un manager
Article.objects.all()
Article.objects.filter(status='published')
```

### ✅ Custom Manager per Query Riutilizzabili

```python
# models.py - PATTERN CORRETTO
from django.db import models
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta

class ArticleManager(models.Manager):
    """Manager custom per Article con query riutilizzabili"""

    def published(self):
        """Ritorna solo articoli pubblicati"""
        return self.filter(
            status='published',
            published_date__isnull=False
        )

    def recent(self, days=30):
        """Articoli pubblicati negli ultimi N giorni"""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.published().filter(
            published_date__gte=cutoff_date
        )

    def with_author_and_tags(self):
        """Ottimizza query con select_related e prefetch_related"""
        return self.select_related('author').prefetch_related('tags')

    def with_comment_count(self):
        """Annota il conteggio commenti"""
        return self.annotate(comment_count=Count('comments'))

    def trending(self, days=7, limit=5):
        """Articoli più popolari per score (commenti + like*2)"""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.published().filter(
            published_date__gte=cutoff_date
        ).annotate(
            score=Count('comments') + Count('likes') * 2
        ).order_by('-score')[:limit]

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey('User', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='draft')
    published_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Assegna il manager custom
    objects = ArticleManager()

    class Meta:
        ordering = ['-created_at']
```

### ✅ View Pulita che Usa il Manager

```python
# views.py - PULITO E LEGGIBILE
from django.shortcuts import render
from .models import Article, User

def dashboard_view(request):
    # Query business logic nei managers
    published_articles = (
        Article.objects
        .published()
        .with_author_and_tags()
        .with_comment_count()
        .order_by('-published_date')[:10]
    )

    active_users = User.objects.active_recent()
    trending_articles = Article.objects.trending(days=7, limit=5)

    return render(request, 'dashboard.html', {
        'published_articles': published_articles,
        'active_users': active_users,
        'trending_articles': trending_articles,
    })
```

**Differenza?**
- ✅ View da 50 righe → 15 righe
- ✅ Logica riutilizzabile
- ✅ Facile da testare
- ✅ Leggibile come inglese

## Custom QuerySets: Query Chainable

### QuerySet Personalizzato per Composizione

```python
# models.py
from django.db.models import QuerySet, Q

class ArticleQuerySet(QuerySet):
    """QuerySet custom con metodi chainable"""

    def published(self):
        return self.filter(status='published', published_date__isnull=False)

    def draft(self):
        return self.filter(status='draft')

    def by_author(self, author):
        return self.filter(author=author)

    def search(self, query):
        return self.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query)
        )

    def with_optimizations(self):
        return self.select_related('author').prefetch_related('tags', 'comments')

class ArticleManager(models.Manager):
    def get_queryset(self):
        # Usa il QuerySet custom di default
        return ArticleQuerySet(self.model, using=self._db)

    # Esponi i metodi del QuerySet
    def published(self):
        return self.get_queryset().published()

    def draft(self):
        return self.get_queryset().draft()

class Article(models.Model):
    # ... fields ...
    objects = ArticleManager()

# ✅ Uso chainable (composizione)
Article.objects.published().by_author(user).search('Django').with_optimizations()
```

## Model Methods: Logica su Singole Istanze

### ✅ Metodi di Istanza vs Manager

```python
# models.py
class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20)
    published_date = models.DateTimeField(null=True)
    view_count = models.IntegerField(default=0)

    objects = ArticleManager()

    # ✅ METODI DI ISTANZA - Operazioni su UN oggetto
    def publish(self):
        """Pubblica l'articolo"""
        self.status = 'published'
        self.published_date = timezone.now()
        self.save(update_fields=['status', 'published_date'])

    def unpublish(self):
        """Rimuovi dalla pubblicazione"""
        self.status = 'draft'
        self.published_date = None
        self.save(update_fields=['status', 'published_date'])

    def increment_views(self):
        """Incrementa visualizzazioni (atomic)"""
        self.view_count = F('view_count') + 1
        self.save(update_fields=['view_count'])

    def is_published(self):
        """Check se pubblicato"""
        return self.status == 'published' and self.published_date is not None

    def get_reading_time(self):
        """Calcola tempo di lettura in minuti"""
        words = len(self.content.split())
        return max(1, words // 200)

    @property
    def preview(self):
        """Anteprima primi 200 caratteri"""
        return self.content[:200] + '...' if len(self.content) > 200 else self.content
```

### ✅ View che Usa i Model Methods

```python
# views.py - PULITO
from django.shortcuts import get_object_or_404, redirect
from .models import Article

def publish_article_view(request, article_id):
    article = get_object_or_404(Article, id=article_id)

    # ❌ NON FARE QUESTO
    # article.status = 'published'
    # article.published_date = timezone.now()
    # article.save()

    # ✅ FAI QUESTO
    article.publish()

    return redirect('article_detail', pk=article.id)

def article_detail_view(request, article_id):
    article = get_object_or_404(Article, id=article_id)

    # ❌ NON FARE QUESTO
    # article.view_count += 1
    # article.save()

    # ✅ FAI QUESTO
    article.increment_views()

    return render(request, 'article.html', {
        'article': article,
        'reading_time': article.get_reading_time(),
        'preview': article.preview,
    })
```

## Tasks.py: Stesso Principio

### ❌ Tasks con Query Complesse (SBAGLIATO)

```python
# tasks.py - ANTI-PATTERN
from celery import shared_task
from django.db.models import Count
from .models import Article, User

@shared_task
def send_weekly_digest():
    # Query complesse nel task
    trending = Article.objects.filter(
        published_date__gte=timezone.now() - timedelta(days=7),
        status='published'
    ).annotate(
        score=Count('comments') + Count('likes') * 2
    ).order_by('-score')[:10]

    active_users = User.objects.filter(
        is_active=True,
        email_verified=True,
        preferences__digest_enabled=True
    )

    for user in active_users:
        # Logica duplicata
        personalized = Article.objects.filter(
            tags__in=user.interests.all(),
            status='published'
        ).distinct()[:5]

        send_email(user, trending, personalized)
```

### ✅ Tasks Puliti con Managers (CORRETTO)

```python
# models.py - Business Logic
class ArticleManager(models.Manager):
    def trending_weekly(self, limit=10):
        """Articoli trending della settimana"""
        cutoff = timezone.now() - timedelta(days=7)
        return self.filter(
            published_date__gte=cutoff,
            status='published'
        ).annotate(
            score=Count('comments') + Count('likes') * 2
        ).order_by('-score')[:limit]

    def personalized_for_user(self, user, limit=5):
        """Articoli personalizzati per interessi utente"""
        return self.filter(
            tags__in=user.interests.all(),
            status='published'
        ).distinct()[:limit]

class UserManager(models.Manager):
    def digest_subscribers(self):
        """Utenti iscritti al digest settimanale"""
        return self.filter(
            is_active=True,
            email_verified=True,
            preferences__digest_enabled=True
        )

# tasks.py - PULITO
from celery import shared_task
from .models import Article, User

@shared_task
def send_weekly_digest():
    # Logica business nei managers
    trending = Article.objects.trending_weekly(limit=10)
    subscribers = User.objects.digest_subscribers()

    for user in subscribers:
        personalized = Article.objects.personalized_for_user(user, limit=5)
        send_email(user, trending, personalized)
```

## Caso Reale: E-commerce Order Processing

### ❌ PRIMA: Logic in Tasks

```python
# tasks.py - ANTI-PATTERN
@shared_task
def process_order(order_id):
    order = Order.objects.get(id=order_id)

    # Validazione nel task
    if order.status != 'pending':
        return

    # Controllo stock nel task
    for item in order.items.all():
        product = item.product
        if product.stock < item.quantity:
            order.status = 'failed'
            order.failure_reason = f'Out of stock: {product.name}'
            order.save()
            return

    # Decrementa stock nel task
    for item in order.items.all():
        product = item.product
        product.stock -= item.quantity
        product.save()

    # Calcola totale nel task
    total = sum(item.product.price * item.quantity for item in order.items.all())

    # Payment nel task
    payment_result = process_payment(order.user, total)

    if payment_result.success:
        order.status = 'completed'
        order.completed_at = timezone.now()
        order.save()
        send_confirmation_email(order)
    else:
        # Rollback stock nel task
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        order.status = 'failed'
        order.save()
```

### ✅ DOPO: Logic in Models

```python
# models.py - Business Logic Centralizzata
class OrderManager(models.Manager):
    def pending(self):
        return self.filter(status='pending')

    def create_from_cart(self, user, cart_items):
        """Crea ordine da carrello"""
        order = self.create(user=user, status='pending')

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )

        return order

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='pending')
    completed_at = models.DateTimeField(null=True)
    failure_reason = models.TextField(blank=True)

    objects = OrderManager()

    def get_total(self):
        """Calcola totale ordine"""
        return sum(item.get_subtotal() for item in self.items.all())

    def check_stock_availability(self):
        """Verifica disponibilità stock"""
        for item in self.items.all():
            if item.product.stock < item.quantity:
                return False, f'Out of stock: {item.product.name}'
        return True, None

    def reserve_stock(self):
        """Decrementa stock (atomic)"""
        for item in self.items.all():
            item.product.stock = F('stock') - item.quantity
            item.product.save(update_fields=['stock'])

    def release_stock(self):
        """Ripristina stock"""
        for item in self.items.all():
            item.product.stock = F('stock') + item.quantity
            item.product.save(update_fields=['stock'])

    def mark_completed(self):
        """Segna ordine come completato"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at'])

    def mark_failed(self, reason):
        """Segna ordine come fallito"""
        self.status = 'failed'
        self.failure_reason = reason
        self.save(update_fields=['status', 'failure_reason'])

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def get_subtotal(self):
        return self.price * self.quantity

# tasks.py - PULITO E LEGGIBILE
from celery import shared_task
from .models import Order

@shared_task
def process_order(order_id):
    order = Order.objects.get(id=order_id)

    # Validazione semplice
    if order.status != 'pending':
        return

    # Business logic nel model
    stock_ok, error_msg = order.check_stock_availability()
    if not stock_ok:
        order.mark_failed(error_msg)
        return

    order.reserve_stock()

    payment_result = process_payment(order.user, order.get_total())

    if payment_result.success:
        order.mark_completed()
        send_confirmation_email(order)
    else:
        order.release_stock()
        order.mark_failed('Payment failed')
```

**Risultato:**
- Task da 60 righe → 20 righe
- Logica testabile separatamente
- Riutilizzabile in views, altri tasks, management commands

## Testing: Il Vero Vantaggio

### ❌ Testare Views con Query è Difficile

```python
# Impossibile testare la query senza chiamare la view
def test_dashboard_view(self):
    response = self.client.get('/dashboard/')
    # Come testo solo la logica della query?
```

### ✅ Testare Managers è Facile

```python
# tests.py
from django.test import TestCase
from .models import Article, User

class ArticleManagerTest(TestCase):
    def setUp(self):
        self.author = User.objects.create(username='author')

    def test_published_returns_only_published(self):
        # Arrange
        Article.objects.create(title='Draft', status='draft', author=self.author)
        published = Article.objects.create(
            title='Published',
            status='published',
            published_date=timezone.now(),
            author=self.author
        )

        # Act
        result = Article.objects.published()

        # Assert
        self.assertEqual(result.count(), 1)
        self.assertEqual(result.first(), published)

    def test_trending_orders_by_score(self):
        # Test isolato della logica trending
        article1 = Article.objects.create(
            title='Popular',
            status='published',
            published_date=timezone.now(),
            author=self.author
        )
        # Simula 10 commenti + 5 like
        # ...

        result = Article.objects.trending(days=7, limit=5)
        self.assertEqual(result.first(), article1)

    def test_search_finds_in_title_and_content(self):
        # Test search logic
        Article.objects.create(
            title='Django Tutorial',
            content='Learn Python',
            author=self.author
        )

        results = Article.objects.search('Django')
        self.assertEqual(results.count(), 1)
```

## Service Layer: Per Logica Multi-Model

Quando la logica coinvolge **più modelli**, usa un **Service Layer**.

### ✅ Service Layer per Transazioni Complesse

```python
# services.py
from django.db import transaction
from .models import Order, Notification, Inventory

class OrderService:
    """Service per logica business multi-model"""

    @staticmethod
    @transaction.atomic
    def complete_purchase(user, cart_items):
        """
        Completa l'acquisto:
        1. Crea ordine
        2. Riserva stock
        3. Processa pagamento
        4. Notifica utente
        5. Aggiorna inventory
        """
        # Crea ordine
        order = Order.objects.create_from_cart(user, cart_items)

        # Verifica stock
        stock_ok, error = order.check_stock_availability()
        if not stock_ok:
            raise ValueError(error)

        # Riserva stock
        order.reserve_stock()

        try:
            # Pagamento
            payment_result = process_payment(user, order.get_total())
            if not payment_result.success:
                raise ValueError('Payment failed')

            # Completa ordine
            order.mark_completed()

            # Notifica
            Notification.objects.create_order_confirmation(user, order)

            # Aggiorna inventory
            Inventory.objects.update_from_order(order)

            return order

        except Exception as e:
            # Rollback automatico grazie a @transaction.atomic
            order.release_stock()
            raise

# views.py - Usa il service
from .services import OrderService

def checkout_view(request):
    cart_items = get_cart_items(request.user)

    try:
        order = OrderService.complete_purchase(request.user, cart_items)
        return redirect('order_success', order_id=order.id)
    except ValueError as e:
        return render(request, 'checkout.html', {'error': str(e)})
```

## Best Practices Riassuntive

### ✅ DO: Fai Questo

**1. Custom Managers per Query Riutilizzabili**
```python
Article.objects.published().recent(days=7)
```

**2. Model Methods per Logica su Istanza**
```python
article.publish()
order.mark_completed()
```

**3. QuerySets per Query Chainable**
```python
Article.objects.published().by_author(user).search('Django')
```

**4. Service Layer per Multi-Model Logic**
```python
OrderService.complete_purchase(user, cart_items)
```

**5. Properties per Computed Fields**
```python
article.reading_time
user.full_name
```

### ❌ DON'T: Non Fare Questo

**1. Query Complesse in Views**
```python
# ❌ NO
articles = Article.objects.filter(...).annotate(...).select_related(...)
```

**2. Business Logic in Tasks**
```python
# ❌ NO
@shared_task
def process():
    if order.status == 'pending':
        # 50 righe di logica
```

**3. Logica Duplicata**
```python
# ❌ NO - Stessa query in 5 posti diversi
```

**4. Fat Views**
```python
# ❌ NO - View di 200 righe
```

**5. Modifiche Dirette in View**
```python
# ❌ NO
article.status = 'published'
article.save()
```

## Struttura File Ideale

```
myapp/
├── models.py           # Models + Managers + QuerySets + Methods
├── services.py         # Service Layer (multi-model logic)
├── views.py            # Thin views (HTTP + orchestrazione)
├── tasks.py            # Thin tasks (Celery + orchestrazione)
├── serializers.py      # DRF serializers (se usi API)
├── forms.py            # Django forms
└── tests/
    ├── test_models.py      # Test managers e methods
    ├── test_services.py    # Test services
    ├── test_views.py       # Test HTTP/response
    └── test_tasks.py       # Test task execution
```

## Metriche di Codice Pulito

### Prima della Refactoring
- ❌ `views.py`: 500 righe
- ❌ `tasks.py`: 300 righe
- ❌ `models.py`: 100 righe
- ❌ Query duplicate: 15+
- ❌ Test coverage: 40%

### Dopo la Refactoring
- ✅ `views.py`: 150 righe
- ✅ `tasks.py`: 80 righe
- ✅ `models.py`: 400 righe (managers + methods)
- ✅ `services.py`: 100 righe
- ✅ Query duplicate: 0
- ✅ Test coverage: 85%

## Conclusione: Il Codice Pulito Scala

Separare la logica di business dalle views e tasks non è solo una questione di "stile":

**Vantaggi concreti:**
- 🧪 **Testing facile** - Logica isolata e testabile
- ♻️ **Riutilizzo** - Managers usabili ovunque
- 📖 **Leggibilità** - Views leggibili come prosa
- 🐛 **Meno bug** - Logica centralizzata = meno errori
- ⚡ **Refactoring veloce** - Cambi in un posto solo
- 👥 **Team scaling** - Codice comprensibile da tutti

**Regola d'oro:**
> Se una query appare più di una volta, va in un Manager.
> Se una logica modifica un model, va in un Method.
> Se la logica coinvolge più models, va in un Service.

**Il tuo `views.py` dovrebbe leggere come una lista della spesa, non come un romanzo.**

## Risorse Utili

- [Django Managers Documentation](https://docs.djangoproject.com/en/stable/topics/db/managers/)
- [Django Best Practices](https://docs.djangoproject.com/en/stable/misc/design-philosophies/)
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x)
- [Django Design Patterns](https://agiliq.com/blog/2013/06/django-design-patterns/)

---

*Hai domande su come refactorare il tuo codice Django? Contattami per una code review!*
