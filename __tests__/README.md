# UniWell Testing Suite

This directory contains tests for the UniWell application. The tests are organized by component and use Jest and React Testing Library.

## Test Structure

- `__tests__/components/dashboard/`: Tests for dashboard wellness components
  - `MeditationTimer.test.tsx`: Tests for the meditation timer component
  - `WaterReminder.test.tsx`: Tests for the water reminder component
  - `ScreenTimeMonitor.test.tsx`: Tests for the screen time monitoring component
- `__tests__/app/dashboard/`: Integration tests for the dashboard page

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only dashboard component tests
npm run test:dashboard
```

## Test Coverage

The test suite covers:

1. **Component Rendering**: Verifies that components render correctly with default and custom props
2. **User Interaction**: Tests user interactions like button clicks and form inputs
3. **Timer Functionality**: Verifies that timers work correctly
4. **State Management**: Tests state changes and updates
5. **Local Storage**: Verifies that data is properly saved to and loaded from localStorage
6. **Integration**: Tests that components work together as expected in the dashboard

## Adding New Tests

When adding new tests:

1. Create a new test file with the `.test.tsx` extension in the appropriate directory
2. Import the component and testing utilities
3. Mock any external dependencies
4. Write tests that cover the component's functionality
5. Run the tests to ensure they pass

## Mocking Dependencies

The tests use Jest's mocking functionality to mock:

- External libraries like `sonner` for toast notifications
- Browser APIs like `localStorage` and `Notification`
- Next.js utilities like routing
- Child components when testing parent components

This allows us to test components in isolation and control the test environment. 