# PolyPath Mobile App

React Native mobile application for the PolyPath language learning platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

3. Start the development server:
```bash
npm start
```

4. Run on a device:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript type definitions
│   ├── contexts/       # React contexts
│   └── config/         # App configuration
├── assets/             # Images, fonts, etc.
├── App.tsx             # Root component
└── package.json
```

## Key Features

- **Authentication**: JWT-based authentication with token refresh
- **Navigation**: React Navigation with bottom tabs
- **API Service**: Axios-based API client with interceptors
- **Type Safety**: Full TypeScript support
- **State Management**: React Context API (to be added)

## Environment Variables

- `API_BASE_URL`: Backend API endpoint (default: http://localhost:8000)
- `NODE_ENV`: Environment (development/production)

## Development

The project uses:
- Expo SDK 54
- React Native 0.81
- TypeScript 5.9
- React Navigation 6
- Axios for API calls
- AsyncStorage for local storage
