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

**Total: 16 configurable product families**

## Architecture

```
src/
├── components/        # UI components (dumb, no business logic)
├── data/
│   ├── catalog/       # Product definitions (steps, options, images)
│   ├── models/        # Product Model ID schemas
│   └── heroContent.ts # Product landing page content
├── rules/             # Constraint engine + per-product rules
├── stores/            # Zustand stores (configuration, myList)
├── hooks/             # React hooks
├── pages/             # Route components
└── utils/             # Helpers (PDF generation, image mapping, etc.)
```

### Key Patterns

- **Constraint Engine**: Matrix-based option filtering. Rules are decoupled from UI.
- **Product Model ID**: Generated from selections. Format varies per product family.
- **My List**: Immutable configuration snapshots with share/export capabilities.

## Tech Stack

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4.1
- Zustand (state management)
- React Router 7
- @react-pdf/renderer (PDF export)

## Getting Started

```bash
npm install
npm run dev
```

## Routes

| Path                     | Description          |
| ------------------------ | -------------------- |
| `/`                      | Product catalog grid |
| `/configurator/:modelId` | Configuration wizard |
| `/my-list`               | Saved configurations |

## Constraint System

Each product has a dedicated rules file (`src/rules/<product>Rules.ts`) defining a constraint matrix:

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
- `reasons: BlockReason[]` (explains why option is disabled)

Disabled options are **never hidden** — always shown with explanation.

## Build & Deploy

```bash
npm run build    # Production build
npm run preview  # Preview production build
```

Deployed via Vercel with SPA rewrite configuration.

## Project Status

Active development. Not all 16 configurators are fully implemented — check `src/pages/InDevelopmentPage.tsx` for placeholder routes.

## License

Proprietary. Internal use only.
