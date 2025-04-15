# UniWell Testing Documentation

This document provides an overview of the testing strategies and methodologies used in the UniWell application.

## Testing Types

### 1. Unit Testing

Testing individual components in isolation to verify they render and behave correctly.

- **Rendering Tests**: Verifying that all expected elements appear correctly
- **State Management Tests**: Checking that component state updates properly
- **Props Validation**: Ensuring components handle different props correctly

```tsx
// Example: Testing component rendering
it('renders the pomodoro timer correctly', () => {
  render(<PomodoroComponent />);
  
  expect(screen.getByTestId('pomodoro-component')).toBeInTheDocument();
  expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument();
  expect(screen.getByTestId('timer-display')).toBeInTheDocument();
});
```

### 2. Component Interaction Testing

Testing user interactions with components to ensure they respond correctly.

- **Click Event Tests**: Testing buttons, selections, toggles
- **Form Input Tests**: Testing text fields, dropdowns, etc.
- **Change Event Tests**: Testing selection of different options

```tsx
// Example: Testing button clicks
it('toggles play/pause button', () => {
  render(<MusicPlayerComponent />);
  
  const playPauseButton = screen.getByTestId('play-pause-button');
  expect(playPauseButton).toHaveTextContent('Play');
  
  fireEvent.click(playPauseButton);
  expect(playPauseButton).toHaveTextContent('Pause');
});
```

### 3. Integration Testing

Testing how components work together and communicate.

- **Parent-Child Communication**: Testing data flow between components
- **Context Consumption**: Testing components that consume context
- **Composed Component Behavior**: Testing component compositions

```tsx
// Example: Testing parent-child integration
it('passes selected category to child component', () => {
  render(<ParentComponent />);
  
  const categorySelector = screen.getByTestId('category-selector');
  fireEvent.change(categorySelector, { target: { value: 'meditation' } });
  
  expect(screen.getByTestId('child-category-display')).toHaveTextContent('meditation');
});
```

### 4. Snapshot Testing

Ensuring UI doesn't change unexpectedly by comparing with previous snapshots.

```tsx
// Example: Snapshot test
it('matches snapshot', () => {
  const { container } = render(<NotificationsComponent />);
  expect(container).toMatchSnapshot();
});
```

### 5. Behavioral Testing

Testing specific behaviors and user flows to ensure they work as expected.

- **Multi-step Interactions**: Testing sequences of user actions
- **State Transitions**: Testing component state changes over time
- **Feature Workflows**: Testing complete user workflows

```tsx
// Example: Testing timer behavior
it('completes a pomodoro cycle and transitions to break', () => {
  render(<PomodoroComponent />);
  
  fireEvent.click(screen.getByTestId('start-stop-button'));
  
  act(() => {
    jest.advanceTimersByTime(25 * 60 * 1000); // 25 minutes
  });
  
  expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00');
  expect(screen.getByTestId('cycles-count')).toHaveTextContent('1');
});
```

### 6. Mock Testing

Using mock functions and data to simulate external dependencies.

- **API Call Mocking**: Simulating backend responses
- **Timer Mocking**: Using Jest's fake timers for time-dependent tests
- **Event Handling Mocking**: Mocking event handlers and callbacks

```tsx
// Example: Mocking API calls
const mockInviteUser = jest.fn().mockImplementation((email) => {
  return Promise.resolve({ success: true, message: `Invitation sent to ${email}` });
});

it('sends invitations and displays results', async () => {
  render(<InviteUsersComponent inviteUser={mockInviteUser} />);
  
  // Test component with mock function
  // ...
  
  expect(mockInviteUser).toHaveBeenCalledWith('test@example.com');
});
```

### 7. Accessibility Testing

Ensuring components are accessible to all users.

- **Keyboard Navigation**: Testing tab order and keyboard interactions
- **Screen Reader Compatibility**: Testing aria attributes and semantic HTML
- **Focus Management**: Testing focus handling for interactive elements

```tsx
// Example: Testing keyboard accessibility
it('allows keyboard navigation between options', () => {
  render(<NavigationComponent />);
  
  const firstItem = screen.getByTestId('nav-item-1');
  firstItem.focus();
  expect(document.activeElement).toBe(firstItem);
  
  fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(screen.getByTestId('nav-item-2'));
});
```

### 8. Conditional Rendering Testing

Testing components display correctly based on different conditions.

- **Loading States**: Testing components during data loading
- **Empty States**: Testing components with no data
- **Error States**: Testing components with error conditions

```tsx
// Example: Testing conditional rendering
it('shows loading state initially', () => {
  render(<DataComponent isLoading={true} />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});

it('shows data when loaded', () => {
  render(<DataComponent isLoading={false} data={mockData} />);
  expect(screen.getByTestId('data-list')).toBeInTheDocument();
});
```

### 9. Error Handling Testing

Testing error states and recovery mechanisms.

- **Form Validation Errors**: Testing form validation
- **API Error Handling**: Testing error responses from API calls
- **Fallback UI**: Testing error boundaries and fallback UIs

```tsx
// Example: Testing error handling
it('displays validation error for invalid email', () => {
  render(<InviteUsersComponent />);
  
  const input = screen.getByTestId('emails-input');
  fireEvent.change(input, { target: { value: 'invalid-email' } });
  fireEvent.click(screen.getByTestId('invite-button'));
  
  expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email');
});
```

## Testing Setup

All tests use React Testing Library with Jest as the testing framework:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
```

Key principles in our testing approach:

1. **User-centric testing**: Testing from the user's perspective
2. **Implementation independence**: Testing behavior, not implementation details
3. **Maintainability**: Writing tests that are resilient to implementation changes
4. **Coverage**: Aiming for high test coverage of critical paths
5. **Readability**: Writing clear, descriptive test cases

## Running Tests

Run all tests:
```bash
npm test
```

Run tests for a specific component:
```bash
npm test __tests__/components/[component-name]
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Continuous Integration

Tests run automatically on:
- Pull requests to main branch
- Pushes to release branches
- Nightly builds

## Testing Best Practices

1. Test component behavior, not implementation details
2. Use data-testid attributes for test selection
3. Keep tests independent and isolated
4. Mock external dependencies
5. Use descriptive test names
6. Follow the AAA pattern (Arrange, Act, Assert)
7. Avoid snapshot testing for complex components 