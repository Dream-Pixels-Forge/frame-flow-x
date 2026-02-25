# Templates

This directory contains code templates and patterns for consistent development across Frame Flow X.

## Available Templates

### Component Templates
- `component.tsx` - Base React component with HeroUI
- `container.tsx` - Page/container component with routing
- `hook.ts` - Custom React hook pattern
- `store.ts` - Zustand store pattern
- `test.tsx` - Vitest test pattern

### Usage

Copy the template you need and customize it for your specific use case:

```bash
# Example: Create a new component
cp templates/component.tsx src/components/MyComponent.tsx
```

## Component Pattern Guidelines

1. **Use HeroUI components** as base
2. **TypeScript** for all components
3. **Framer Motion** for animations
4. **Zustand** for state management
5. **Vitest** for testing

## Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Tests: `*.test.tsx` or `*.test.ts`
