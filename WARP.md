# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router architecture with TypeScript, React 19, and Tailwind CSS 4. The project has the React Compiler enabled for automatic optimization.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The app runs at http://localhost:3000 with hot module replacement.

### Building for Production
```bash
npm run build
```
Creates an optimized production build in `.next/`

### Starting Production Server
```bash
npm run start
```
Runs the production build (must run `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint with Next.js configuration. The project uses ESLint 9 with the flat config format.

## Architecture

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration and metadata
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind CSS and custom theme variables
- `public/` - Static assets (SVG icons and images)
- `next.config.ts` - Next.js configuration with React Compiler enabled

### Key Technologies
- **Next.js 16** with App Router - File-based routing with server and client components
- **React 19** - Latest React with concurrent features
- **React Compiler** - Enabled via `reactCompiler: true` in next.config.ts for automatic memoization
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS 4** - Using new @import syntax and @theme inline directives
- **ESLint 9** - Flat config format with Next.js presets

### Path Aliases
The project uses `@/*` to reference `src/*` files (configured in tsconfig.json).

### Styling Approach
- Tailwind CSS 4 with the new `@import "tailwindcss"` syntax
- Custom CSS variables defined in `globals.css` for theme colors
- `@theme inline` directive for Tailwind theme customization
- Dark mode support via `prefers-color-scheme`
- Geist Sans and Geist Mono fonts loaded via `next/font/google`

### React Patterns
- All components in `src/app/` are Server Components by default
- Use `"use client"` directive when client-side interactivity is needed
- React Compiler automatically optimizes components (no need for manual `useMemo`/`useCallback`)

## Development Notes

- TypeScript strict mode is enabled - all code must be fully typed
- The project uses ES2017 as the compilation target
- Module resolution is set to "bundler" for optimal Next.js compatibility
- ESLint ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
