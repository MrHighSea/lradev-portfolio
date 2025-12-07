---
title: "Ottimizzazione Query Django: select_related vs prefetch_related"
date: "2025-12-08T09:00:00"
excerpt: "Guida completa all'ottimizzazione delle query Django per evitare il problema N+1. Scopri come usare select_related e prefetch_related con esempi pratici e casi d'uso reali."
category: "Backend"
author: "Luca Altimare"
---

# Ottimizzazione Query Django: select_related vs prefetch_related

Uno degli errori più comuni nello sviluppo Django è il **problema N+1**: eseguire centinaia di query al database quando ne basterebbe una sola. In questo articolo vedremo come risolverlo con `select_related` e `prefetch_related`.

## Il Problema N+1: Il Nemico delle Performance

### Scenario Tipico

Immagina di avere questi modelli:

```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    published_date = models.DateField()

class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    comment = models.TextField()
```

### Il Codice "Innocente" che Uccide le Performance

```python
# ⚠️ CODICE PESSIMO - Problema N+1
books = Book.objects.all()

for book in books:
    print(f"{book.title} di {book.author.name}")
    # Query 1: SELECT * FROM book
    # Query 2: SELECT * FROM author WHERE id = 1
    # Query 3: SELECT * FROM author WHERE id = 2
    # Query 4: SELECT * FROM author WHERE id = 3
    # ... 100 query se hai 100 libri!
```

**Risultato:** Con 100 libri esegui **101 query** (1 per i libri + 100 per gli autori).

## select_related: Per Relazioni ForeignKey e OneToOne

### Come Funziona

`select_related` usa una **JOIN SQL** per recuperare oggetti correlati in una singola query.

### ✅ Quando Usarlo

- Relazioni **ForeignKey** (many-to-one)
- Relazioni **OneToOne**
- Quando accedi a **un solo** oggetto correlato per istanza

### Sintassi Base

```python
# ✅ OTTIMIZZATO - Una sola query con JOIN
books = Book.objects.select_related('author').all()

for book in books:
    print(f"{book.title} di {book.author.name}")
    # Una sola query:
    # SELECT * FROM book
    # INNER JOIN author ON book.author_id = author.id
```

### Esempio Pratico: API Endpoint

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def book_list(request):
    # ❌ PESSIMO - N+1 query
    # books = Book.objects.all()

    # ✅ OTTIMIZZATO
    books = Book.objects.select_related('author').all()

    data = [{
        'title': book.title,
        'author': book.author.name,
        'email': book.author.email
    } for book in books]

    return Response(data)
```

### Select_Related con Relazioni Multiple

```python
class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

# ✅ Recupera tutte le relazioni in una query
books = Book.objects.select_related('author', 'publisher', 'category').all()

for book in books:
    print(f"{book.title} di {book.author.name}")
    print(f"Editore: {book.publisher.name}")
    print(f"Categoria: {book.category.name}")
    # Una sola query con 3 JOIN!
```

### Select_Related con Relazioni Annidate

```python
class Publisher(models.Model):
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)

# ✅ Accesso a relazioni "profonde" (author e country del publisher)
books = Book.objects.select_related(
    'author',
    'publisher__country'  # Nota il doppio underscore
).all()

for book in books:
    print(f"{book.title} - Pubblicato in {book.publisher.country.name}")
```

## prefetch_related: Per Relazioni ManyToMany e Reverse ForeignKey

### Come Funziona

`prefetch_related` esegue una query **separata** per ogni relazione e unisce i risultati in Python.

### ✅ Quando Usarlo

- Relazioni **ManyToMany**
- Relazioni **reverse ForeignKey** (es. `book.reviews.all()`)
- Quando accedi a **molti** oggetti correlati per istanza

### Sintassi Base

```python
class Book(models.Model):
    title = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag)

# ✅ OTTIMIZZATO - 2 query invece di N+1
books = Book.objects.prefetch_related('tags').all()

for book in books:
    tags = ", ".join([tag.name for tag in book.tags.all()])
    print(f"{book.title} - Tags: {tags}")
    # Query 1: SELECT * FROM book
    # Query 2: SELECT * FROM tag WHERE id IN (1, 2, 3, ...)
```

### Esempio Pratico: Recensioni dei Libri

```python
# ❌ PESSIMO - Problema N+1
books = Book.objects.all()

for book in books:
    reviews = book.reviews.all()  # Query per ogni libro!
    print(f"{book.title}: {reviews.count()} recensioni")

# ✅ OTTIMIZZATO
books = Book.objects.prefetch_related('reviews').all()

for book in books:
    reviews = book.reviews.all()  # Nessuna query aggiuntiva!
    print(f"{book.title}: {reviews.count()} recensioni")
    # Query 1: SELECT * FROM book
    # Query 2: SELECT * FROM review WHERE book_id IN (1, 2, 3, ...)
```

### Prefetch_Related con Filtri: Prefetch Object

```python
from django.db.models import Prefetch

# ✅ Carica solo recensioni con rating >= 4
high_rated_reviews = Prefetch(
    'reviews',
    queryset=Review.objects.filter(rating__gte=4),
    to_attr='high_reviews'  # Nome custom per l'attributo
)

books = Book.objects.prefetch_related(high_rated_reviews).all()

for book in books:
    print(f"{book.title}:")
    for review in book.high_reviews:  # Usa to_attr
        print(f"  - Rating: {review.rating}/5")
```

### Prefetch_Related Annidato

```python
# ✅ Carica libri → recensioni → utenti che hanno scritto le recensioni
books = Book.objects.prefetch_related(
    Prefetch('reviews', queryset=Review.objects.select_related('user'))
).all()

for book in books:
    for review in book.reviews.all():
        print(f"{review.user.username}: {review.comment}")
```

## Combinare select_related e prefetch_related

### Scenario Complesso

```python
# Modelli
class Author(models.Model):
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag)

# ✅ Query ottimale: 3 query totali invece di centinaia
books = Book.objects.select_related(
    'author',           # ForeignKey → usa JOIN
    'author__country'   # ForeignKey annidato → usa JOIN
).prefetch_related(
    'tags'              # ManyToMany → query separata
).all()

for book in books:
    tags = ", ".join([t.name for t in book.tags.all()])
    print(f"{book.title} di {book.author.name} ({book.author.country.name})")
    print(f"Tags: {tags}\n")
```

## Casi d'Uso Reali

### 📚 Dashboard Admin con Statistiche

```python
from django.db.models import Count, Avg

# ✅ Dashboard efficiente
authors = Author.objects.select_related('country').prefetch_related(
    Prefetch('book_set', queryset=Book.objects.annotate(
        avg_rating=Avg('reviews__rating')
    ))
).annotate(
    total_books=Count('book')
).all()

for author in authors:
    print(f"{author.name} ({author.country.name})")
    print(f"Libri pubblicati: {author.total_books}")
    for book in author.book_set.all():
        rating = book.avg_rating or 0
        print(f"  - {book.title}: {rating:.1f}⭐")
```

### 🛒 E-commerce: Carrello con Prodotti

```python
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()

# ✅ Carica ordini con tutti i prodotti
orders = Order.objects.select_related('user').prefetch_related(
    Prefetch('items', queryset=OrderItem.objects.select_related('product'))
).all()

for order in orders:
    print(f"Ordine di {order.user.username} - {order.created_at}")
    for item in order.items.all():
        print(f"  - {item.product.name} x{item.quantity}")
```

### 🏢 Sistema Blog con Commenti Annidati

```python
class Post(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

# ✅ Carica post con commenti e risposte
posts = Post.objects.select_related('author').prefetch_related(
    Prefetch('comments', queryset=Comment.objects.select_related('author').filter(parent__isnull=True)),
    Prefetch('comments__comment_set', queryset=Comment.objects.select_related('author'))
).all()
```

## Debug e Misurazione delle Performance

### Django Debug Toolbar

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # ...
]

INTERNAL_IPS = ['127.0.0.1']
```

Visualizzerai il numero esatto di query eseguite!

### Logging delle Query

```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Contare le Query Manualmente

```python
from django.db import connection
from django.test.utils import override_settings

@override_settings(DEBUG=True)
def test_query_count():
    # Reset contatore
    connection.queries_log.clear()

    # Esegui codice
    books = Book.objects.select_related('author').all()
    list(books)  # Forza esecuzione query

    # Stampa numero query
    print(f"Numero query: {len(connection.queries)}")
    for query in connection.queries:
        print(query['sql'])
```

## Errori Comuni da Evitare

### ❌ Errore 1: Usare select_related su ManyToMany

```python
# ❌ SBAGLIATO - select_related non funziona con ManyToMany
books = Book.objects.select_related('tags').all()

# ✅ CORRETTO
books = Book.objects.prefetch_related('tags').all()
```

### ❌ Errore 2: Non Usare to_attr con Filtri

```python
# ❌ SBAGLIATO - Filtrare dopo prefetch vanifica l'ottimizzazione
books = Book.objects.prefetch_related('reviews').all()
for book in books:
    high_reviews = book.reviews.filter(rating__gte=4)  # Query aggiuntiva!

# ✅ CORRETTO - Usa Prefetch con to_attr
books = Book.objects.prefetch_related(
    Prefetch('reviews', queryset=Review.objects.filter(rating__gte=4), to_attr='high_reviews')
).all()
for book in books:
    high_reviews = book.high_reviews  # Nessuna query!
```

### ❌ Errore 3: Over-fetching

```python
# ❌ SBAGLIATO - Carichi dati che non userai
books = Book.objects.select_related('author', 'publisher', 'category').all()[:5]
# Se mostri solo il titolo, hai caricato dati inutili

# ✅ CORRETTO - Carica solo ciò che serve
books = Book.objects.only('title').all()[:5]
```

## Best Practices

### ✅ 1. Usa only() e defer() per Limitare i Campi

```python
# Carica solo i campi necessari
books = Book.objects.only('title', 'published_date').select_related('author').all()

# Escludi campi pesanti
books = Book.objects.defer('description').select_related('author').all()
```

### ✅ 2. Usa Prefetch per Query Custom

```python
recent_reviews = Review.objects.filter(
    created_at__gte=timezone.now() - timezone.timedelta(days=30)
).select_related('user')

books = Book.objects.prefetch_related(
    Prefetch('reviews', queryset=recent_reviews, to_attr='recent_reviews')
).all()
```

### ✅ 3. Combina con Annotate per Aggregati

```python
from django.db.models import Count, Avg

books = Book.objects.select_related('author').annotate(
    review_count=Count('reviews'),
    avg_rating=Avg('reviews__rating')
).all()

for book in books:
    print(f"{book.title}: {book.avg_rating:.1f}⭐ ({book.review_count} recensioni)")
```

### ✅ 4. Test di Performance

```python
import time
from django.db import connection

# Benchmark
def benchmark_query(queryset):
    start = time.time()
    connection.queries_log.clear()

    list(queryset)  # Forza esecuzione

    elapsed = time.time() - start
    num_queries = len(connection.queries)

    print(f"Tempo: {elapsed:.2f}s - Query: {num_queries}")

# Test
benchmark_query(Book.objects.all())  # Lento
benchmark_query(Book.objects.select_related('author').all())  # Veloce
```

## Tabella Riassuntiva

### **select_related**
- ✅ **Relazioni:** ForeignKey, OneToOne
- ✅ **Meccanismo:** SQL JOIN (una query)
- ✅ **Quando usarlo:** Accesso a un singolo oggetto correlato
- ✅ **Performance:** Eccellente per relazioni 1-a-1
- ❌ **Non usare con:** ManyToMany, reverse ForeignKey

### **prefetch_related**
- ✅ **Relazioni:** ManyToMany, reverse ForeignKey
- ✅ **Meccanismo:** Query separata + join in Python
- ✅ **Quando usarlo:** Accesso a molti oggetti correlati
- ✅ **Performance:** Eccellente per relazioni 1-a-molti
- ✅ **Bonus:** Supporta filtri con Prefetch()

## Conclusione

L'ottimizzazione delle query Django non è opzionale: è **fondamentale** per applicazioni scalabili.

**Regole d'oro:**
1. **ForeignKey/OneToOne** → `select_related`
2. **ManyToMany/Reverse FK** → `prefetch_related`
3. **Combina** entrambi quando necessario
4. **Misura sempre** con Django Debug Toolbar
5. **Testa** con dati realistici

**Un'applicazione ben ottimizzata:**
- Esegue 10 query invece di 1000
- Risponde in 50ms invece di 5 secondi
- Scala senza problemi a migliaia di utenti

## Risorse Utili

- [Django QuerySet API](https://docs.djangoproject.com/en/stable/ref/models/querysets/)
- [Django Debug Toolbar](https://django-debug-toolbar.readthedocs.io/)
- [Database Access Optimization](https://docs.djangoproject.com/en/stable/topics/db/optimization/)

---

*Hai domande sull'ottimizzazione delle query Django? Contattami per una consulenza!*
