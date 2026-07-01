# React Coding Guidelines

## 📏 General Line Length Guidelines
* Ideal Size: Under 100 lines. These files are incredibly easy to read, test, and debug.
* Maximum Limit: 250–300 lines. Once a file crosses this threshold, it becomes difficult for a human developer to skim and fully understand at a glance.
* The Exception: 500+ lines. Complex files like massive multi-step forms or interactive dashboards often push past 500 lines. While acceptable if strictly necessary, they should be aggressively reviewed for refactoring.

## 🧩 What Should Actually Go Inside a React File?
To keep file sizes under control, split your content according to its exact functional role:
1. **One Primary Component Per File**: Export exactly one main component per file. Small, private sub-components are allowed only if they are simple, not reused elsewhere, and keep the total line count low.
2. **Separate UI Layout from Business Logic**: Do not overload UI files with raw API calls, heavy data mutations, or complicated algorithms. Move side-effects to custom hooks, and independent JS math/helpers to separate utils.
3. **Split Out Large Configurations**: Declare large static arrays, configurations, or dropdown options in an external constants file and import them.

## 📂 Recommended Directory Layout
src/
├── assets/          # Global static files (images, icons, fonts)
├── components/      # Shared, reusable UI elements (Button, Input, Modal)
├── config/          # App-wide configurations (API clients, environment setups)
├── context/         # Global state management providers (Auth, Theme)
├── features/        # Core business logic divided by app domains
│   ├── authentication/
│   │   ├── components/  # Feature-specific UI (LoginForm, SignupForm)
│   │   ├── hooks/       # Custom feature hooks (useAuth, useLogin)
│   │   ├── services/    # Feature API calls (authApi.js)
│   │   └── index.js     # Public API exporting only what the app needs
│   └── dashboard/
├── hooks/           # Shared, global custom React hooks (useLocalStorage, useWindowSize)
├── layouts/         # Page shell wrappers (AdminLayout, PublicLayout)
├── pages/           # Route-level components mapped directly to your router
├── routes/          # Central router setup definitions
├── utils/           # Pure JavaScript helper functions (date formatters, math validators)
├── App.jsx          # Root application component
└── main.jsx         # Application entry point

## 🔑 Core Architecture Principles
1. **Keep "Shared" Components Simple**: Root `src/components/` is for atomic UI elements. No business logic or API calls.
2. **Group by Feature (Domain-Driven)**: Root `src/features/` containerizes different app domains.
3. **Keep the "Pages" Layer Thin**: Page components should correspond directly to routes and act only as organizers importing features/layouts.
4. **Avoid Deep Nesting**: Limit nesting to 3-4 levels. Use absolute imports.

---

# Backend Coding Guidelines (Node.js / Express)

## 📂 Recommended Monorepo Directory Layout

```
my-project/
├── backend/                  # Node.js + Express application
│   ├── config/               # Database connections & env verification
│   ├── controllers/          # Business logic & request handlers
│   ├── middleware/           # Auth protectors, global error handlers
│   ├── models/               # Sequelize / Mongoose schema definitions
│   ├── routes/               # Express endpoint-to-controller mappings
│   ├── services/             # External integrations (email, S3, AI APIs)
│   ├── utils/                # Pure server-side helper scripts
│   ├── .env                  # Private backend environment secrets
│   ├── server.js             # Main server entry file
│   └── package.json          # Backend npm dependencies
│
├── frontend/                 # React application
│   ├── public/               # Public static items
│   ├── src/                  # React source (see React Guidelines above)
│   ├── .env                  # Frontend environment variables
│   └── package.json          # Frontend npm dependencies
│
├── .gitignore                # Global git ignore
├── package.json              # Root package to orchestrate concurrent runs
└── README.md                 # Setup documentation
```

## 📏 Backend File Length Guidelines

* **Server Entry** (`server.js` / `index.ts`): **30–50 lines**. Only database initialization, global middleware (CORS, JSON), and route mounting. Zero business logic.
* **Route Files**: **20–50 lines**. Only URL path mappings, HTTP methods, and middleware guards. No DB queries.
* **Model Files** (Schemas): **30–60 lines**. Only field definitions, validation rules, and indexes.
* **Controller Files**: **50–120 lines**. This is where files run longest — but if a single controller exceeds 150 lines, split it (e.g., `authController.ts` + `profileController.ts` instead of one monolithic `userController.ts`).

## 🏛️ MVC Pattern — Single Responsibility Per Layer

### 1. Routes (Traffic Cop)
- ✅ Route paths, HTTP methods, middleware guards
- ❌ No database queries, no business calculations

```js
// routes/userRoutes.js
router.post('/login', protectRoute, loginUser);
```

### 2. Controllers (The Brains)
- ✅ `req.body` / `req.params` parsing, DB CRUD calls, `res.status()` responses, validation triggers
- ❌ No heavy calculations, no raw encryption, no external API calls (move those to `services/`)

```js
// controllers/userController.js
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

### 3. Middleware (Security Guards)
- ✅ JWT verification, role/permission checks, file upload parsing
- ✅ Must always call `next()` on pass, or return an error response immediately on fail
- ❌ No business logic

### 4. Services (External Integrations)
- ✅ Email senders, S3 uploads, AI API calls, push notifications
- Controllers should call service functions — not implement them inline

### 5. Utils (The Tool Belt)
- ✅ Pure JavaScript functions: JWT generation, password hashing, date formatters, currency converters
- ❌ No Express (`req`/`res`) or database dependencies

## 🔑 Core Backend Architecture Principles

1. **Fat Controller = Red Flag**: If a controller function handles DB queries + sends emails + resizes images + logs analytics, break it apart immediately into `services/`.
2. **No Logic in Routes**: Routes are mapping only. A route file that imports `sequelize` is a violation of SRP.
3. **env Isolation**: All secrets (DB URIs, JWT keys, API keys) stay in `.env`. Never hardcode. Never commit.
4. **Centralized Error Handling**: Use a global Express error middleware instead of duplicate `try/catch` patterns in every controller.
5. **Concurrently for DX**: Use the `concurrently` npm package at the root `package.json` to start both frontend and backend with a single `npm run dev`.

## 🚨 Warning Signs — Your Backend File Is Too Big

Refactor immediately if you see:
1. **Callback Hell / Deep Nesting**: 3+ levels of nested `if/else` or `.then()` chains inside a controller. Use `async/await` + centralized error middleware.
2. **Fat Controllers**: One controller function does DB queries + emails + image processing + analytics. Move email/image logic to `services/`.
3. **Inline Monolithic Schemas**: Deeply nested subdocuments crammed into one model file. Split into separate models and use `.populate()` / Sequelize `include`.

---

# Flutter & Dart Coding Guidelines

For Flutter and Dart applications, the Single Responsibility Principle remains the gold standard. Because Flutter is declarative, building complex layouts can quickly lead to deep nesting (known as "Widget Hell"). Therefore, keeping file sizes strictly managed is crucial for app performance and maintainability.

A healthy Flutter/Dart file should stay under 150 to 200 lines of code.

## 📏 File Length Breakdown for Flutter/Dart

* **Ideal Size**: Under 100 lines. Perfect for atomic UI components, isolated business logic controllers, or model blueprints.
* **Maximum Limit**: 250 lines. Once a UI file hits 250 lines, it usually means you have nested too many widgets or inline functions together.
* **The Exception**: Up to 400 lines. Highly complex animations, custom painters, or main page controllers managing multiple state scenarios might stretch this far, but they should be monitored closely.

## 🧩 What Goes Inside a Dart File? (By Architectural Layer)

In clean modern architecture (like BLoC, Clean Architecture, or Feature-First Layouts), split your application content based on these distinct Dart files:

### 1. UI Files (Widgets)
* **What it has**: Exactly one primary public Widget class per file (e.g., `ProfileScreen` or `CustomButton`).
* **The Rule**: Keep building block elements light. If your layout requires deep widget tree hierarchies (e.g., a complex column with multiple sections), extract sections out into separate independent files or private widgets at the bottom of the same file if they are small.
* **What it should NOT have**: Direct database requests, network calls, or extensive variable processing loop logic.

### 2. State Management / Business Logic Files
* **What it has**: Logic that handles updating what the screen shows (e.g., Cubits, Blocs, ChangeNotifiers, or Riverpod Providers).
* **The Rule**: One file per feature module or view engine layer.
* **Example**: `login_notifier.dart` handles updating the UI state from "loading" to "success" or "error".

### 3. Data Models (`models/`)
* **What it has**: Simple blueprints for data structure matching your backend payload, class constructors, and standard parsing methods.
* **The Rule**: Only include JSON mapping methods (`fromJson`, `toJson`) or equivalence evaluations.
* **Example**: `user_model.dart` should strictly hold properties like `final String id;` and `final String email;`.

### 4. Repositories & Services (`repositories/` or `services/`)
* **What it has**: The actual mechanics interacting with the outside world, like HTTP client wrappers (Dio, Http) or Local Device Storage plugins (Isar, Hive, SharedPreferences).
* **Example**: `api_service.dart` handles the raw network requests and returns raw responses.

## 🚨 Flutter Warning Signs: Your File Is Too Big

You need to refactor and split your code if you experience these common Flutter code smells:
1. **"Widget Hell" (Deep Rightward Nesting)**: If your indentation pushes your code so far to the right that it is cut off on your screen, extract your nested widgets into their own separate layout files.
2. **Giant Multi-Purpose `setState` Call blocks**: If a StatefulWidget is managing form validation, fetching data over the web, and transforming dates simultaneously within inline methods, move the logic out to a proper state management class.
3. **Massive Inline `Theme.of(context)` or Style Bloat**: If half of your widget file is filled with long inline styles, colors, and margins, pull those values into a central design system file (`app_theme.dart` or `app_colors.dart`).

---

# Python & FastAPI Coding Guidelines

For a Python FastAPI server, the philosophy shifts slightly. Python is highly expressive and concise, meaning a lot of functionality can be written in very few lines. However, FastAPI heavily relies on type hints and Pydantic schemas, which can inflate file sizes if not organized properly.

A healthy FastAPI file should stay under 100 to 150 lines of code.

## 📏 File Length Breakdown for FastAPI

* **Main Application Entry** (`main.py`): **20–40 lines**. It should only initialize the FastAPI app instance, register CORS middlewares, connect/disconnect database lifespans, and include your router modules.
* **Routers (Endpoints)**: **30–80 lines**. These define your API paths (`@router.get()`), inject dependencies, and call service functions. They should not contain direct database queries or heavy algorithms.
* **Schemas (Pydantic Models)**: **30–60 lines**. These define data validation rules for incoming requests and outgoing responses.
* **Services / CRUD Logic**: **50–120 lines**. This is where your business logic, calculations, and database queries live. If a service file crosses 150 lines, split it by sub-domain (e.g., `auth_service.py` vs. `user_service.py`).

## 🧩 What Exactly Should Go Inside Each File Type?

To keep your files highly scannable and maintainable, use a Router-Service-Repository pattern:

### 1. Routers (`routers/` or `api/`)
* **What it has**: Route decorators, HTTP methods, path definitions, dependencies (like `Depends(get_current_user)`), status codes, and response models.
* **What it should NOT have**: Direct SQL queries, password hashing logic, or third-party API fetch logic.
* **Example**:
  ```python
  # routers/products.py
  @router.post("/", response_model=ProductResponse, status_code=201)
  def create_new_product(product_in: ProductCreate, db: Session = Depends(get_db)):
      return product_service.create(db, obj_in=product_in)
  ```

### 2. Schemas (`schemas/`)
* **What it has**: Pydantic classes inheriting from `BaseModel`. This is where you declare field types, default values, and data validations using Pydantic fields or custom validators.
* **Best Practice**: Keep request data schemas (`ProductCreate`) and response data schemas (`ProductResponse`) in the same file if they are short, or split them if they require heavy customization.

### 3. Services / CRUD (`services/` or `crud/`)
* **What it has**: Raw Python logic, data manipulation, ORM queries (SQLAlchemy, SQLModel, or Tortoise), and error raising (`HTTPException`).
* **Example**:
  ```python
  # services/product.py
  def create(db: Session, obj_in: ProductCreate):
      db_obj = Product(**obj_in.dict())
      db.add(db_obj)
      db.commit()
      db.refresh(db_obj)
      return db_obj
  ```

### 4. Models (`models/`)
* **What it has**: Database tables map definitions (e.g., SQLAlchemy Base classes or SQLModel definitions). They should strictly represent the database blueprint layout and indexes.

## 🚨 FastAPI Warning Signs: Your File Is Too Big

You need to refactor and split your Python files if you spot these code smells:
1. **Fat Endpoints**: Your router functions contain multi-line database transactions, try-except blocks catching raw database driver exceptions, and conditional data parsing. Move everything after the function declaration into a service layer.
2. **Inline Pydantic Definitions**: Declaring Pydantic request body models right inside the `main.py` or router file where they are used. Always extract them to a dedicated `schemas/` directory.
3. **Monolithic Dependencies (`dependencies.py` over 200 lines)**: Storing user authentication, permission gating, database connections, and external service clients inside one single global dependency file. Break them up into separate modules (e.g., `deps/auth.py`, `deps/database.py`).
