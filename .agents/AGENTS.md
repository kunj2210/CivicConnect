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
