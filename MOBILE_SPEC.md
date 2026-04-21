# La Niche CRM — Spécification mobile & data

> Document de référence pour tout agent ou développeur qui intègre l'application mobile avec le CRM.  
> Stack CRM : Next.js 16 · Supabase (PostgreSQL + Auth + RLS) · PWA deployée sur Vercel.

---

## 1. Authentification

**Provider** : Supabase Auth (JWT).

```
URL  : NEXT_PUBLIC_SUPABASE_URL
KEY  : NEXT_PUBLIC_SUPABASE_ANON_KEY   ← clé publique, safe côté client
```

- Chaque boutique = **un utilisateur Supabase Auth**.  
- `auth.uid()` est l'identifiant universel de la boutique — il sert de clé primaire dans `shops` ET de foreign key dans `shop_stock`.
- Le mobile s'authentifie avec `supabase.auth.signInWithPassword({ email, password })`.  
- Après connexion, toutes les requêtes sont automatiquement scopées par la RLS à la boutique connectée — **aucun filtre manuel n'est nécessaire côté mobile si tu utilises le client Supabase authentifié**.

---

## 2. Schéma des tables

### 2.1 `shops` — profil de la boutique

| Colonne | Type | Description |
|---|---|---|
| `id` | `uuid` PK | = `auth.uid()` — jamais généré, toujours = l'UID auth |
| `name` | `text` | Nom de la boutique |
| `address_line` | `text` | Rue + numéro (ex: "30 Rue Henri Barbusse") |
| `postal_code` | `text` | Code postal |
| `city` | `text` | Ville |
| `country` | `text` | Pays (défaut "France") |
| `latitude` | `float8` | Coordonnée GPS (remplie via api-adresse.data.gouv.fr) |
| `longitude` | `float8` | Coordonnée GPS |
| `website_url` | `text\|null` | Site web |
| `instagram_url` | `text\|null` | Instagram |
| `created_at` | `timestamptz` | Date de création |
| `updated_at` | `timestamptz` | Dernière mise à jour profil |

**RLS** : lecture/écriture uniquement si `auth.uid() = id`.  
**Trigger** : à chaque inscription, un shop est créé automatiquement avec le nom issu de `user_metadata.name`.

**Requête mobile type — profil boutique :**
```js
const { data: shop } = await supabase
  .from("shops")
  .select("name, address_line, postal_code, city, country, latitude, longitude, website_url, instagram_url")
  .eq("id", session.user.id)
  .maybeSingle();
```

---

### 2.2 `shop_stock` — inventaire des parfums

| Colonne | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Identifiant de l'article |
| `shop_id` | `uuid` FK | = `auth.uid()` de la boutique propriétaire |
| `perfume_name` | `text` | Nom du parfum |
| `brand` | `text` | Marque |
| `price` | `numeric(10,2)\|null` | Prix catalogue normal |
| `quantity` | `integer` | Quantité totale en stock |
| `is_private_sale` | `boolean` | `true` = l'article est en braderie VIP |
| `private_sale_price` | `numeric(10,2)\|null` | Prix bradé (rempli si `is_private_sale = true`) |
| `sale_quantity` | `integer\|null` | Nb d'unités mise en braderie (`null` = toutes) |
| `private_sale_enabled_at` | `timestamptz\|null` | Date de bascule en braderie |
| `created_at` | `timestamptz` | Date d'ajout |

**RLS** : SELECT/INSERT/UPDATE/DELETE uniquement si `auth.uid() = shop_id`.

**Requête mobile type — tout le stock :**
```js
const { data } = await supabase
  .from("shop_stock")
  .select("id, perfume_name, brand, price, quantity, is_private_sale, private_sale_price, sale_quantity")
  .eq("shop_id", session.user.id)
  .order("perfume_name");
```

**Requête mobile type — seulement les articles en braderie :**
```js
const { data } = await supabase
  .from("shop_stock")
  .select("id, perfume_name, brand, price, quantity, private_sale_price, sale_quantity, private_sale_enabled_at")
  .eq("shop_id", session.user.id)
  .eq("is_private_sale", true)
  .order("private_sale_enabled_at", { ascending: false });
```

---

### 2.3 `private_sales` — historique braderies (optionnel)

Table secondaire pour historiser les braderies passées. Non utilisée activement par le CRM — les braderies actives sont gérées directement via `shop_stock.is_private_sale`.

| Colonne | Type | Description |
|---|---|---|
| `id` | `uuid` PK | — |
| `shop_id` | `uuid` FK | Boutique propriétaire |
| `perfume_id` | `uuid` FK | → `shop_stock.id` |
| `discounted_price` | `numeric(10,2)` | Prix bradé historisé |
| `status` | `text` | `active` ou `expired` |
| `created_at` | `timestamptz` | — |

---

## 3. Règles métier

| Règle | Implémentation |
|---|---|
| 1 boutique = 1 user Auth | `shops.id = auth.uid()` |
| Isolation totale entre boutiques | RLS sur toutes les tables, `shop_id = auth.uid()` |
| Article en braderie | `is_private_sale = true` + `private_sale_price` rempli |
| Quantité partielle bradée | `sale_quantity` (null = toutes les unités) |
| Adresse géocodée | `latitude`/`longitude` via api-adresse.data.gouv.fr (FR) ou Nominatim (fallback) |
| Onboarding obligatoire | Si `address_line` vide ou `latitude = 0`, l'app affiche l'écran de complétion profil |
| Notification Shopify | API route `/api/notify-sale` (POST) envoie un email récap à l'admin |

---

## 4. API interne (Next.js)

### `POST /api/notify-sale`

Déclenché depuis la page Vitrine VIP quand la boutique veut notifier la braderie à mettre en ligne sur Shopify.

**Body JSON :**
```json
{
  "shopName": "Ma Boutique",
  "month": "Juin 2026",
  "items": [
    {
      "perfume_name": "Chance Eau Tendre",
      "brand": "Chanel",
      "price": 120.00,
      "private_sale_price": 89.00,
      "quantity": 5,
      "sale_quantity": 3
    }
  ]
}
```

**Réponse :** `{ ok: true, id: "resend_email_id" }`  
**Destinataire fixe :** `tidianetambadoupro@gmail.com`  
**Env var requise :** `RESEND_API_KEY` (serveur uniquement, non préfixée `NEXT_PUBLIC_`)

---

## 5. Variables d'environnement

| Variable | Côté | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Serveur | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Serveur | Clé publique Supabase |
| `RESEND_API_KEY` | Serveur uniquement | Envoi d'emails braderie |

---

## 6. Ce que le mobile doit faire

### Récupérer le profil complet d'une boutique
```js
// S'authentifier d'abord
const { data: { session } } = await supabase.auth.getSession();
const uid = session.user.id;

// Profil
const { data: shop } = await supabase
  .from("shops")
  .select("*")
  .eq("id", uid)
  .maybeSingle();

// Stock complet
const { data: stock } = await supabase
  .from("shop_stock")
  .select("*")
  .eq("shop_id", uid)
  .order("perfume_name");

// Braderie uniquement
const vitrine = stock.filter(i => i.is_private_sale);
```

### Afficher la boutique sur une carte
```js
// shop.latitude et shop.longitude sont directement exploitables
// Marker OSM : https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=16/{lat}/{lng}
```

### Vérifier si l'onboarding est complet
```js
const onboardingDone = shop && shop.address_line && shop.latitude !== 0;
```

---

## 7. Migrations SQL à appliquer si pas encore fait

```sql
-- Colonne quantité bradée (ajoutée après le schéma initial)
ALTER TABLE public.shop_stock
  ADD COLUMN IF NOT EXISTS sale_quantity integer;

-- Colonnes profil boutique (si manquantes)
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS address_line    text,
  ADD COLUMN IF NOT EXISTS postal_code     text,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS country         text DEFAULT 'France',
  ADD COLUMN IF NOT EXISTS latitude        float8 DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longitude       float8 DEFAULT 0,
  ADD COLUMN IF NOT EXISTS website_url     text,
  ADD COLUMN IF NOT EXISTS instagram_url   text,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz;
```

---

## 8. Prompt agent — modifications CRM

Copie-colle ce prompt à n'importe quel agent qui doit intervenir sur ce projet :

```
Tu travailles sur "La Niche CRM", une application Next.js 16 + Supabase pour gérer
le stock de boutiques de parfums.

## Architecture

- Stack : Next.js 16 (App Router), Supabase (Auth + PostgreSQL + RLS), Tailwind CSS v4,
  Framer Motion, Resend (emails), déployé sur Vercel.
- Toute la data passe par le client Supabase directement (pas d'API routes sauf /api/notify-sale).
- Le client est un singleton dans src/lib/supabase.ts.

## Modèle de données

### Table `shops`
Profil de la boutique. Une ligne par utilisateur auth.
- id (uuid PK) = auth.uid()
- name, address_line, postal_code, city, country
- latitude, longitude (float8) — géocodé via api-adresse.data.gouv.fr
- website_url, instagram_url (nullable)
- created_at, updated_at

### Table `shop_stock`
Inventaire des parfums. Scoped par shop_id.
- id (uuid PK), shop_id (uuid FK → shops.id = auth.uid())
- perfume_name, brand
- price (numeric), quantity (integer)
- is_private_sale (boolean) — article en braderie VIP
- private_sale_price (numeric) — prix bradé
- sale_quantity (integer, nullable) — nb d'unités bradées (null = toutes)
- private_sale_enabled_at (timestamptz)
- created_at

## RLS (Row Level Security)
Toutes les tables ont RLS activé.
- shops : auth.uid() = id
- shop_stock : auth.uid() = shop_id
→ Un utilisateur ne peut JAMAIS voir ou modifier les données d'une autre boutique.

## Règles importantes
1. Ne jamais écrire "shop_id" en dur — toujours lire session.user.id via supabase.auth.getSession().
2. La variable RESEND_API_KEY est serveur uniquement (pas de préfixe NEXT_PUBLIC_).
   Instancier new Resend(key) DANS le handler POST, jamais au niveau module.
3. Tailwind CSS v4 avec @theme variables dans src/app/globals.css.
   Tokens : --color-primary, --color-accent, --color-secondary, --color-border, --color-muted-foreground.
4. L'app est une PWA standalone. Toute nouvelle page doit :
   - Avoir un PageHeader avec title et right slot.
   - Fonctionner avec le BottomNav (mobile) et la Sidebar (desktop lg:).
   - Le main a déjà pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0.
5. Les iframes OpenStreetMap sont autorisées par la CSP dans next.config.ts.
   Ne pas modifier les headers CSP sans vérifier la compatibilité.
6. L'adresse est autocompletée via api-adresse.data.gouv.fr (composant AddressAutocomplete.tsx).
   La carte est rendue via ShopMap.tsx (iframe OSM avec fallback offline).

## Pages existantes
- / → Dashboard KPIs + graphes recharts + carte boutique
- /inventory → CRUD shop_stock, import CSV, import texte libre (paste)
- /sales → Vitrine VIP (drag&drop desktop / onglets mobile), notification email Shopify
- /ai-insights → Page statique teaser IA
- /contact → Page statique

## Avant toute modification
- Lire le fichier concerné avant d'éditer.
- Vérifier que les nouvelles colonnes DB ont une migration ALTER TABLE correspondante.
- Ne pas appeler useRef<T>() sans valeur initiale (React 19 strict).
- Ne pas instancier de clients API au niveau module dans les API routes (Vercel build).
```
