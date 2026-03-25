# STI Build It Configurator

Internal product configurator for Safety Technology International (STI). Enables sales engineers, distributors, and customers to configure activation and protection devices with real-time constraint validation and Product Model ID generation.

## Product Lines

| Category          | Products                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Push Buttons      | G3 Multipurpose, GF Fire Alarm, Indoor, Waterproof                                                 |
| Call Points       | Global ReSet, ReSet Call Points, Waterproof ReSet                                                  |
| Protective Covers | Universal Stopper, Low Profile Universal Stopper, Enviro Stopper, Euro Stopper, Call Point Stopper |
| Enclosures        | EnviroArmour                                                                                       |
| Other             | Key Switches, Alert Point, Stopper Stations                                                        |

**Total: 15 configurable product families**

## Architecture

FSD-like (Feature-Sliced Design) with strict layer hierarchy.

Dependency flow: `app → pages → features → entities → shared`

```
src/
├── app/                       # Application shell (App.tsx, global styles)
├── entities/
│   └── product/
│       ├── catalog/           # Product metadata (steps, options, images)
│       ├── models/            # Product Model ID schemas per product family
│       ├── rules/             # Constraint engine + per-product constraint matrices
│       ├── buildProductModel.ts
│       └── registry.ts        # Unified product registry (meta + model)
├── features/
│   ├── auth/                  # Authentication (Supabase Auth)
│   │   ├── components/        # AuthInitializer, RouteGuards
│   │   ├── lib/               # Error mapping
│   │   └── store/             # authStore (Zustand)
│   ├── configurator/          # Product configuration wizard
│   │   ├── components/        # BuildItCalculator, Sidebar, MainPanel, layouts
│   │   ├── hooks/             # useConfiguration, useModelTranslations
│   │   ├── lib/               # filterOptions, PDF generation, hero content
│   │   └── store/             # configurationStore (Zustand)
│   └── projects/              # Project management and saved configurations
│       ├── components/        # ProjectPicker, FilterResults, ExportModal
│       ├── hooks/             # useFilterState, useProjectSelectors
│       ├── lib/               # filterProducts, XLSX export
│       └── store/             # projectStore (Zustand, persisted)
├── pages/                     # Route-level page components
├── shared/
│   ├── api/                   # Supabase client, auth/configurations/projects API
│   ├── hooks/                 # Generic hooks (useMediaQuery)
│   ├── i18n/                  # Internationalization (EN, UK) with per-model translations
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Reusable UI components (Layout, ProductCard, ConfiguratorHero)
│   └── utils/                 # Generic helpers (serialization, toast, env)
└── tests/                     # Unit tests (entities/product coverage)
```

Path aliases configured in `vite.config.ts`: `@app`, `@entities`, `@features`, `@pages`, `@shared`.

### Key Patterns

- **Constraint Engine** (`entities/product/rules/constraintEngine.ts`): matrix-based option filtering. Per-product rules are decoupled from UI.
- **Product Model ID** (`entities/product/buildProductModel.ts`): generated from user selections. Code format varies per product family.
- **Product Registry** (`entities/product/registry.ts`): unified map of all products (metadata + model definition).
- **Configuration Store** (`features/configurator/store/configurationStore.ts`): Zustand store managing wizard state with cascading reset on constraint violations.
- **Project Store** (`features/projects/store/projectStore.ts`): persisted Zustand store managing guest and remote (Supabase) saved configurations.
- **i18n**: custom context-based system with per-model translation files in `shared/i18n/locales/{lang}/models/`.

## Tech Stack

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- Zustand 5 (state management)
- Supabase (auth, database)
- React Router 7
- @react-pdf/renderer (PDF export)
- xlsx-js-style (XLSX export)
- Vitest (testing)

## Getting Started

```bash
npm install
npm run dev
```

## Routes

| Path                  | Auth     | Description                        |
| --------------------- | -------- | ---------------------------------- |
| `/`                   | Public   | Product catalog grid               |
| `/configurator/:slug` | Public   | Configuration wizard               |
| `/my-list`            | Public   | Guest saved configurations         |
| `/projects`           | Required | User projects list                 |
| `/projects/:id`       | Required | Project detail with configurations |
| `/login`              | Guest    | Sign in                            |
| `/register`           | Guest    | Sign up                            |
| `/reset-password`     | Guest    | Password reset request             |
| `/update-password`    | Public   | Password update (from email link)  |
| `/account`            | Required | User account settings              |

## Constraint System

Each product has a dedicated rules file (`src/entities/product/rules/<product>Rules.ts`) defining a constraint matrix:

```typescript
{
  sourceStep: "colour",
  targetStep: "cover",
  matrix: {
    "red": ["cover-a", "cover-b"],
    "blue": ["cover-a"]
  }
}
```

The `ConstraintEngine` evaluates selections and returns:

- `available: boolean`
- `reasons: BlockReason[]` (explains why an option is disabled)

Disabled options are never hidden — always shown with explanation.

Additionally, per-product allowlist functions validate that a combination of selections leads to a real product model code.

## Build & Deploy

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests (watch mode)
npm run test:run   # Run tests (single run)
```

Deployed via Vercel with SPA rewrite configuration.

## Project Status

Active development. Not all 15 configurators are fully implemented — check `isImplemented` flag in catalog metadata.

## License

Proprietary. Internal use only.
