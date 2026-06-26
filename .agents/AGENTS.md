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
