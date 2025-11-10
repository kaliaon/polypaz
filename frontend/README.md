# Full-Stack Starter Frontend

This is the frontend part of the Full-Stack Starter project, built with Vue 3, TypeScript, and Vite.

## Features

- **Vue 3**: Modern reactive UI framework with composition API and TypeScript support
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Vite**: Lightning-fast build tool and dev server
- **Vue Router**: Official router for Vue.js
- **Internationalization (i18n)**: Support for multiple languages using vue-i18n

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Internationalization

This project includes full internationalization support using vue-i18n. Translation files are located in `src/locales/`.

See [i18n documentation](./docs/i18n-guide.md) for more details on how to work with translations.

## Project Structure

```
frontend/
├── src/
│   ├── assets/         # Static assets like images, fonts
│   ├── components/     # Reusable Vue components
│   ├── i18n/           # Internationalization setup
│   ├── locales/        # Translation files
│   ├── router/         # Vue router configuration
│   ├── types/          # TypeScript type definitions
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   ├── main.ts         # Application entry point
│   └── style.css       # Global styles
├── public/             # Public static files
└── ...configuration files
```

## Learn More

- [Vue.js Documentation](https://vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
