# Auth Component

A secure authentication component for UniWell that handles user login, registration, and account management.

## Features

- Secure login and registration forms
- Password reset functionality
- OAuth integration with popular providers
- Session persistence
- Robust validation with error handling
- Protected route management

## Usage

```tsx
import { AuthComponent } from '@/components/auth/AuthComponent';

// For login
<AuthComponent mode="login" onSuccess={(user) => handleSuccess(user)} />

// For registration
<AuthComponent mode="register" onSuccess={(user) => handleSuccess(user)} />

// For password reset
<AuthComponent mode="reset" onSuccess={() => handleReset()} />
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `mode` | `'login' \| 'register' \| 'reset'` | Authentication mode | `'login'` |
| `onSuccess` | `(user?: User) => void` | Callback on successful auth | - |
| `onError` | `(error: Error) => void` | Callback on auth error | - |
| `redirectUrl` | `string` | URL to redirect after successful auth | `'/dashboard'` |

## Configuration

The Auth component requires proper setup in your application's environment variables:

```
NEXT_PUBLIC_AUTH_PROVIDER=nextauth
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Testing

Run the tests for this component with:

```bash
npm test components/auth
``` 