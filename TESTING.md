# Testing in UniWell

This document provides an overview of the testing setup and practices used in the UniWell project.

## Testing Stack

The project uses the following testing tools:

- **Jest**: Testing framework
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **jest-environment-jsdom**: For browser-like environment in tests

## Getting Started with Testing

### Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (only runs tests related to changed files)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for specific components
npm run test:dashboard  # Runs only dashboard component tests
```

## Test Organization

- `__tests__/`: Root directory for tests
  - `components/`: Component tests
    - `dashboard/`: Dashboard component tests
  - `app/`: Page tests
    - `dashboard/`: Dashboard page tests
  - `README.md`: Detailed information about tests

## Testing Patterns

### Component Testing

We test components by:

1. Rendering the component
2. Interacting with it (if applicable)
3. Asserting about the expected outcome

Example:

```jsx
it('updates duration when slider is adjusted', () => {
  render(<MeditationTimer userId="test-user" />);
  
  // Find slider and change value
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: 20 } });

  // Assert the expected changes
  expect(screen.getByText('20 min')).toBeInTheDocument();
});
```

### Mock Implementations

We use mocks for external dependencies to focus on testing component logic:

```jsx
// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
```

### Testing Timers

For components with timer functionality, we use Jest's timer mocks:

```jsx
// Setup fake timers
jest.useFakeTimers();

// Fast-forward time
act(() => {
  jest.advanceTimersByTime(1000); // advance 1 second
});

// Clean up
jest.useRealTimers();
```


```bash
npm run test:coverage
```

## Debugging Tests

If a test fails:

1. Check the error message and stack trace
2. Use `screen.debug()` to see the current state of the DOM
3. Add `console.log` statements to understand what's happening
4. Try running just that test file with `npx jest path/to/test.tsx` 