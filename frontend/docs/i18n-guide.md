# Internationalization (i18n) Guide

This project uses [Vue I18n](https://vue-i18n.intlify.dev/) for internationalization. This guide explains how to work with translations and add new languages.

## Structure

- **Locale Files**: Located in `src/locales` with each language having its own JSON file (e.g., `en.json`, `fr.json`)
- **i18n Configuration**: Located in `src/i18n/index.ts`
- **Language Selector**: Component at `src/components/LanguageSelector.vue`

## Using Translations in Components

1. Import the useI18n composable:

```typescript
import { useI18n } from "vue-i18n";
```

2. Setup the translation function in your component:

```typescript
const { t } = useI18n();
```

3. Use the translation in your template:

```html
<template>
  <h1>{{ t('some.translation.key') }}</h1>
</template>
```

4. For translations with parameters:

```html
<template>
  <p>{{ t('welcome.message', { name: user.name }) }}</p>
</template>
```

## Adding a New Language

1. Create a new JSON file in the `src/locales` folder (e.g., `fr.json`)
2. Structure it the same way as `en.json`
3. Uncomment and update the corresponding entry in the `availableLocales` array in `src/i18n/index.ts`:

```typescript
export const availableLocales = [
  {
    code: "en",
    name: "English",
  },
  { code: "fr", name: "Français" },
  // Add more languages as needed
];
```

## Advanced Usage

### Pluralization

```json
// en.json
{
  "items": "no items | one item | {count} items"
}
```

```html
<template>
  <p>{{ t('items', count) }}</p>
</template>
```

### Date/Time Formatting

To enable date formatting, uncomment and configure the `datetimeFormats` in `src/i18n/index.ts`.

### Number Formatting

To enable number formatting, uncomment and configure the `numberFormats` in `src/i18n/index.ts`.

## Best Practices

1. **Use nested keys** to organize translations logically
2. **Keep translations short** and focused
3. **Use variables** for dynamic content rather than concatenation
4. **Comment unclear keys** in the JSON files
5. **Keep languages in sync** by ensuring all keys exist in all language files
