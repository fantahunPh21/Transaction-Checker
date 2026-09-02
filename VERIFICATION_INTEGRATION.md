
## Overview

The verification system allows users to verify transactions by entering transaction numbers and selecting banks. It supports multiple Ethiopian banks, including Telebirr, CBE, BOA, Awash Bank, Abay Bank, and Addis International Bank.



### Core Components

1. **Verification Service** 

2. **Verification Hook** 
3. **Transaction Verifier Component** 

4. **Verification Integration** 
### API Endpoints

- `POST /api/v1/verification/verify` - Verify a transaction
- `GET /api/v1/verification/verify` - Get available banks

## Features

### Supported Banks

- **Telebirr** 
- **CBE**
- **BOA** 
- **Awash Bank**
- **Abay Bank**
- **Addis International Bank**

### Verification Process

1. User selects a bank from the dropdown
2. User enters the invoice/transaction number
3. System validates the format based on bank-specific patterns
4. System calls the appropriate bank API
5. Results are displayed with transaction details

### Common Issues

1. **"Invalid invoice number format"** - Check that the transaction number matches the bank's pattern
2. **"Network error or service unavailable"** - The bank's verification service may be down
3. **"Transaction not found"** - The transaction number may be incorrect or expired

### Debug Mode

Enable debug logging by checking the browser console for detailed error information.


