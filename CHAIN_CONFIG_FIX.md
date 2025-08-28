# Chain Configuration Fix for Staging

## Problem Solved
The staging environment was connecting to Base Mainnet instead of Base Sepolia, causing transactions to request mainnet funds.

## Solution Implemented

### 1. Updated `app/providers.tsx`
```typescript
// Determine chains based on environment
// In staging, ONLY use Sepolia to prevent mainnet connections
const chains = isStaging ? [baseSepolia] : [base, baseSepolia];
const defaultChain = isStaging ? baseSepolia : base;

// Force chain in OnchainKit
const currentChain = isStaging ? baseSepolia : (chainId === baseSepolia.id ? baseSepolia : base);

// Set initial chain in RainbowKit
<RainbowKitProvider 
  modalSize="compact"
  initialChain={defaultChain}
>
```

### 2. How It Works

**Production (https://base-hodl.xyz)**:
- Allows both Base Mainnet and Base Sepolia
- Defaults to Base Mainnet
- Uses mainnet contract: `0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1`

**Staging (https://base-hodl-staging.vercel.app)**:
- ONLY allows Base Sepolia (mainnet removed from chain list)
- Forces all connections to Sepolia
- Uses Sepolia contract: `0x71Da6632aD3De77677E82202853889bFC5028989`

### 3. Key Changes

1. **Chain List**: Staging only includes Sepolia in the wagmi config
2. **Default Chain**: Staging sets Sepolia as the initial/default chain
3. **Force Chain**: OnchainKit always uses Sepolia in staging mode

## Testing

To verify the fix works:

1. Visit https://base-hodl-staging.vercel.app
2. Connect your wallet
3. Check that it automatically switches to Base Sepolia
4. Try to create a lock - it should use Sepolia testnet tokens

## Environment Variables

Make sure these are set in Vercel:

**Production Project** (`base-hodl-xyz`):
```
NEXT_PUBLIC_VAULT_ADDRESS=0xB5c9DeAa90E8547274d8A76604D4D7dB0A8996d1
# No IS_STAGING flag
```

**Staging Project** (`base-hodl-staging`):
```
NEXT_PUBLIC_VAULT_ADDRESS=0x71Da6632aD3De77677E82202853889bFC5028989
NEXT_PUBLIC_IS_STAGING=true
```

The `NEXT_PUBLIC_IS_STAGING` flag is crucial - it determines which network to use!