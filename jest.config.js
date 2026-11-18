/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    'services/orders/Orders.service.ts',
    'services/routes/Routes.service.ts',
    'services/errors/InsufficientCredits.ts',
    'services/billing/Credits.service.ts',
    'context/CreditsContext.tsx',
    'hooks/useOrders.ts',
    'hooks/useRoutes.ts',
    'context/RouteContext.tsx',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
