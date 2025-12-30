# Troubleshooting Guide

## 🚨 **Current Issues & Solutions**

### 1. API 500 Errors (Internal Server Error)

**Problem**: All API calls are returning 500 status codes
**Cause**: Backend server is down, misconfigured, or has internal errors

**Solutions**:

#### Check Backend Status
```bash
# Check if your backend is running
curl http://localhost:8080/finance-payment-confirmation/api/v1/health

# Or check the specific endpoints
curl http://localhost:8080/finance-payment-confirmation/api/v1/payment-records
```

#### Verify Backend Configuration
1. **Check Backend Port**: Ensure your backend is running on port 8080 (not 8088)
2. **Check Backend Logs**: Look for error messages in your backend console
3. **Database Connection**: Verify your backend can connect to the database

#### Update Environment Variables
Create a `.env.local` file in your project root:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/finance-payment-confirmation/api/v1
```

### 2. Data Structure Issues

**Problem**: `Cannot read properties of undefined (reading 'map')`
**Cause**: API is returning undefined or null data

**Solutions**:

#### Add Data Validation
```typescript
// Before using data, check if it exists
if (user.shopBranches && Array.isArray(user.shopBranches)) {
  user.shopBranches.map((b) => b.shopBranchName).join(", ")
} else {
  "No branches assigned"
}
```

#### Use Optional Chaining
```typescript
// Use optional chaining to safely access nested properties
user.shopBranches?.map((b) => b.shopBranchName).join(", ") || "No branches assigned"
```

### 3. Port Configuration Mismatch

**Problem**: Frontend trying to connect to wrong port
**Current**: Port 8088 (incorrect)
**Should be**: Port 8080 (correct)

**Solutions**:

#### Update API Configuration
The configuration has been updated in:
- `lib/api.ts` - Default port changed to 8080
- `app/(main)/page.tsx` - Hardcoded URLs updated
- `config/api.ts` - Centralized configuration

#### Verify Backend Port
```bash
# Check what port your backend is actually running on
netstat -an | grep LISTEN | grep 8080
# or
lsof -i :8080
```

## 🔧 **Quick Fixes**

### 1. Restart Your Backend
```bash
# Stop your backend server and restart it
# Make sure it's running on port 8080
```

### 2. Clear Browser Cache
```bash
# Hard refresh your browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### 3. Check Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Refresh the page
4. Look for failed requests and check their status

### 4. Test API Endpoints
```bash
# Test basic connectivity
curl -v http://localhost:8080/finance-payment-confirmation/api/v1/health

# Test with authentication (if required)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/finance-payment-confirmation/api/v1/payment-records
```

## 🚀 **Prevention**

### 1. Add Error Boundaries
```typescript
// Wrap components that might fail
<ErrorBoundary fallback={<ErrorComponent />}>
  <YourComponent />
</ErrorBoundary>
```

### 2. Add Loading States
```typescript
// Show loading while data is being fetched
{isLoading ? <LoadingSpinner /> : <DataComponent data={data} />}
```

### 3. Add Data Validation
```typescript
// Validate data before using it
const safeData = data || []
const safeUser = user || { shopBranches: [] }
```

## 📋 **Checklist**

- [ ] Backend server is running on port 8080
- [ ] Backend can connect to database
- [ ] Backend logs show no errors
- [ ] Frontend environment variables are correct
- [ ] Browser cache is cleared
- [ ] Network requests are successful
- [ ] Data structure matches expected format

## 🆘 **Still Having Issues?**

1. **Check Backend Logs**: Look for error messages
2. **Check Database**: Ensure database is accessible
3. **Check Network**: Verify firewall/network settings
4. **Check Dependencies**: Ensure all required services are running

## 📞 **Support**

If you're still experiencing issues:
1. Check the backend logs for specific error messages
2. Verify the backend is accessible from your machine
3. Test the API endpoints directly with curl or Postman
4. Check if there are any CORS or authentication issues
