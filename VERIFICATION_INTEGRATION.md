# Transaction Verification Integration

This document describes how the transaction verification functionality has been integrated into the main Finance App.

## Overview

The verification system allows users to verify transactions by entering transaction numbers and selecting banks. It supports multiple Ethiopian banks including Telebirr, CBE, BOA, Awash Bank, Abay Bank, and Addis International Bank.

## Architecture

### Core Components

1. **Verification Service** (`lib/verification.ts`)
   - Singleton service for handling verification logic
   - Supports multiple bank APIs
   - Handles validation and parsing

2. **Verification Hook** (`hooks/use-verification.ts`)
   - Custom React hook for managing verification state
   - Provides loading states, results, and error handling
   - Integrates with toast notifications

3. **Transaction Verifier Component** (`components/transaction-verifier.tsx`)
   - Main verification form component
   - Bank selection, invoice number input, and result display
   - Form validation and error handling

4. **Verification Integration** (`components/verification-integration.tsx`)
   - Reusable component for embedding verification in other parts of the app
   - Dialog-based interface for quick verification

### API Endpoints

- `POST /api/v1/verification/verify` - Verify a transaction
- `GET /api/v1/verification/verify` - Get available banks

## Features

### Supported Banks

- **Telebirr** - Direct API integration with ethiotelecom.et
- **CBE** - Commercial Bank of Ethiopia
- **BOA** - Bank of Abyssinia
- **Awash Bank**
- **Abay Bank**
- **Addis International Bank**

### Verification Process

1. User selects a bank from the dropdown
2. User enters the invoice/transaction number
3. System validates the format based on bank-specific patterns
4. System calls the appropriate bank API
5. Results are displayed with transaction details

### Integration Points

1. **Standalone Page** - `/verification` route with full verification interface
2. **Embedded Component** - Can be used in other components via `VerificationIntegration`
3. **API Integration** - Backend verification service for other banks

## Usage Examples

### Basic Verification Page

```tsx
import { TransactionVerifier } from "@/components/transaction-verifier"

export default function VerificationPage() {
  return (
    <div>
      <h1>Transaction Verification</h1>
      <TransactionVerifier 
        onVerificationComplete={(result) => {
          console.log("Verification completed:", result)
        }}
      />
    </div>
  )
}
```

### Embedded Verification

```tsx
import { VerificationIntegration } from "@/components/verification-integration"

export function PaymentRecordRow({ record }) {
  return (
    <div>
      <span>{record.id}</span>
      <VerificationIntegration 
        triggerText="Verify"
        size="sm"
        onVerificationComplete={(result) => {
          // Handle verification result
        }}
      />
    </div>
  )
}
```

### Using the Hook

```tsx
import { useVerification } from "@/hooks/use-verification"

export function CustomVerifier() {
  const { verifyTransaction, isLoading, result } = useVerification()
  
  const handleVerify = async () => {
    const result = await verifyTransaction({
      bank: "telebirr",
      invoiceNumber: "ABC12345"
    })
  }
  
  return (
    <div>
      {/* Your custom UI */}
    </div>
  )
}
```

## Configuration

### Bank Patterns

Each bank has a specific pattern for transaction numbers:

- **Telebirr**: 8-12 alphanumeric characters
- **CBE**: Starts with "CBE" + 8-15 alphanumeric characters
- **BOA**: Starts with "BOA" + 8-15 alphanumeric characters
- **Awash**: Starts with "AWB" + 8-15 alphanumeric characters
- **Abay**: Starts with "ABY" + 8-15 alphanumeric characters
- **Addis**: Starts with "AIB" + 8-15 alphanumeric characters

### Adding New Banks

To add a new bank, update the `BANK_CONFIGS` in `lib/verification.ts`:

```typescript
export const BANK_CONFIGS = {
  // ... existing banks
  newBank: {
    name: "New Bank Name",
    baseUrl: "https://newbank.com/verify/",
    pattern: /^NEW[A-Z0-9]{8,15}$/,
    color: "#FF0000",
  },
}
```

## Security Considerations

1. **Authentication Required** - All verification endpoints require valid authentication
2. **Input Validation** - Transaction numbers are validated against bank-specific patterns
3. **Rate Limiting** - Consider implementing rate limiting for verification requests
4. **Error Handling** - Sensitive error information is not exposed to users

## Future Enhancements

1. **QR Code Scanning** - Add QR code scanning for mobile devices
2. **Bulk Verification** - Support for verifying multiple transactions at once
3. **Verification History** - Store and display verification history
4. **Advanced Parsing** - Improve HTML parsing for better transaction detail extraction
5. **Real-time Updates** - WebSocket integration for real-time verification status

## Troubleshooting

### Common Issues

1. **"Invalid invoice number format"** - Check that the transaction number matches the bank's pattern
2. **"Network error or service unavailable"** - The bank's verification service may be down
3. **"Transaction not found"** - The transaction number may be incorrect or expired

### Debug Mode

Enable debug logging by checking the browser console for detailed error information.

## Support

For issues or questions about the verification integration, please refer to the main application documentation or contact the development team.
