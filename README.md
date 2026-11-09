# custom-toast

A tiny toast/snackbar component for React Native & Expo apps.

**Zero runtime dependencies.** It only needs `react` and `react-native`, which your app
already has — no Zustand, no Reanimated, no icon library, no NativeWind/Tailwind. Everything
is built from what React and React Native already ship.

```
┌──────────────────────────────┐
│  ✓  Saved successfully       │   <- a toast, auto-hides after ~2.4s
└──────────────────────────────┘
```

## Why this exists

Most toast libraries pull in an animation library, an icon set, and sometimes their own state
manager. This one is small enough to read top to bottom in a few minutes (`src/toastStore.ts` is
~50 lines, `src/Toast.tsx` is ~100), so you can copy it into any project and know exactly what
it's doing — no black box.

## How it works (the short version)

1. **`toastStore.ts`** — holds "what's the current toast?" as plain module variables, with a
   small list of subscriber callbacks. This is the same pattern libraries like Zustand use
   internally, just without the library.
2. **`Toast.tsx`** — a component called `ToastProvider` that reads that store with React's
   built-in `useSyncExternalStore` hook, and renders a pill with a fade animation using React
   Native's built-in `Animated` API.
3. **`showToast(message, tone)`** — a plain function, callable from *anywhere* (a button press,
   an API error handler, a hook) — it doesn't need to be inside a component.

You mount `<ToastProvider />` **once**, near the root of your app. Every call to `showToast(...)`
anywhere else in your app makes that one instance display a toast.

## Installation

You have two options. Pick whichever fits how you work.

### Option A — copy the source in (simplest for a beginner)

Copy the `src/` folder into your project (e.g. as `src/components/toast/`), and import from
there:

```ts
import { ToastProvider, showToast } from '@/components/toast';
```

No build step, no package manager changes — it's just three TypeScript files living in your app.

### Option B — install directly from GitHub

If you want to reuse this across multiple projects without copy-pasting:

```bash
npm install github:raeeznazar/Custom-toast
```

This adds it to your `package.json` as a `github:` dependency. Clone it locally instead if you'd
rather point at a folder on disk:

```bash
git clone https://github.com/raeeznazar/Custom-toast.git
cd Custom-toast
npm install   # installs typescript + react/react-native as dev deps, only needed once
npm run build # compiles src/ -> dist/
```

```bash
cd your-app
npm install ../Custom-toast
```

Import it exactly like any npm package:

```ts
import { ToastProvider, showToast } from 'custom-toast';
```

> If you later want this on the public npm registry, the only change needed is running
> `npm publish` from this folder — the package is already structured for it.

## Usage

**Step 1 — mount `<ToastProvider />` once, near your app's root.** In an Expo app this is
usually your top-level `App.tsx`, above your navigation container:

```tsx
// App.tsx
import { ToastProvider } from 'custom-toast'; // or your copied path

export default function App() {
  return (
    <>
      <YourNavigationContainer />
      <ToastProvider />
    </>
  );
}
```

**Step 2 — call `showToast(...)` from anywhere:**

```ts
import { showToast } from 'custom-toast';

showToast('Saved successfully', 'success');
showToast('No internet connection', 'error');
showToast('Heads up, something happened', 'info');
showToast('Check this before continuing', 'warning');
showToast('This is a default toast'); // tone defaults to 'default'
```

This works just as well inside an API error handler that isn't a component at all:

```ts
try {
  await saveProfile(data);
  showToast('Profile updated', 'success');
} catch (error) {
  showToast(error.message, 'error');
}
```

See [`example/App.tsx`](./example/App.tsx) for a complete runnable screen with one button per
tone.

## API reference

### `showToast(message, tone?, durationMs?)`

| Param        | Type        | Default     | Description                                  |
| ------------ | ----------- | ------------ | --------------------------------------------- |
| `message`    | `string`    | required     | The text to display.                          |
| `tone`       | `ToastTone` | `'default'`  | One of `'default' \| 'info' \| 'warning' \| 'success' \| 'error'`. Controls color + icon. |
| `durationMs` | `number`    | `2400`       | How long the toast stays visible before it auto-hides. |

### `hideToast()`

Hides the current toast immediately, skipping the fade-out. Rarely needed — toasts auto-hide on
their own.

### `<ToastProvider />`

Mount once, near your app's root.

| Prop           | Type                              | Default | Description                                                        |
| -------------- | --------------------------------- | ------- | -------------------------------------------------------------------- |
| `bottomOffset` | `number`                           | `80`    | Distance in px from the bottom of the screen. Raise it if you have a tab bar overlapping the toast. |
| `colors`       | `Partial<Record<ToastTone, string>>` | —    | Override one or more tone colors, e.g. `{ error: '#D00000' }`. Unset tones keep the defaults below. |

## The five tones

Matches a Default / Info / Warning / Success / Error palette:

| Tone      | Default color | Symbol |
| --------- | ------------- | ------ |
| `default` | `#4C6FFF`      | ●      |
| `info`    | `#2563EB`      | ℹ      |
| `warning` | `#F2B705`      | ⚠      |
| `success` | `#22C55E`      | ✓      |
| `error`   | `#EF4444`      | ✕      |

To use your own brand colors everywhere, pass `colors` to `ToastProvider`:

```tsx
<ToastProvider colors={{ success: '#16A34A', error: '#DC2626' }} />
```

## Troubleshooting

- **Nothing shows up when I call `showToast(...)`.** Make sure `<ToastProvider />` is actually
  mounted somewhere in your component tree — it renders `null` until a toast is shown, so it's
  easy to forget. It only needs to be mounted *once*, not on every screen.
- **The toast is hidden behind my tab bar.** Increase `bottomOffset` on `<ToastProvider />`.
- **I need more than one toast visible at a time (a queue).** This component intentionally shows
  only the latest toast (calling `showToast` again replaces the current one). If you need a
  stacked queue, extend `toastStore.ts` to hold an array instead of a single `ToastState`.

## Project structure

```
Custom-toast/
├── src/
│   ├── toastStore.ts   # the subscriber-based store + showToast()/hideToast()
│   ├── Toast.tsx        # the <ToastProvider /> component
│   └── index.ts         # public exports
├── example/
│   └── App.tsx          # a runnable demo screen
├── package.json
├── tsconfig.json
└── README.md             # this file
```
