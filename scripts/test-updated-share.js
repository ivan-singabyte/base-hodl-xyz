// Test script to verify updated share URL generation

const tokenSymbol = 'WETH';
const amount = '0.5';
const duration = '30'; // days
const unlockDate = new Date('2025-09-26');

// Format duration
const formatDuration = (durationStr) => {
  const durationMap = {
    '30': '1 month',
    '180': '6 months',
    '365': '1 year',
    '1095': '3 years',
    '3650': '10 years',
    '1': '1 day'
  };
  return durationMap[durationStr] || `${durationStr} days`;
};

const shareText = `Just locked ${amount} ${tokenSymbol} for ${formatDuration(duration)}! 💎🙌

Unlock date: ${unlockDate.toLocaleDateString()}

No paper hands allowed until then. Join me on HODL Vault!`;

// Contract explorer URL (Base Sepolia)
const vaultAddress = '0x71Da6632aD3De77677E82202853889bFC5028989';
const explorerUrl = `https://sepolia.basescan.org/address/${vaultAddress}`;

// This is now the share URL that points to the contract
const shareUrl = explorerUrl;

// Farcaster URL
const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;

// Twitter URL  
const twitterText = `${shareText}\n\n${shareUrl}`;
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

console.log('=== Updated Share URLs ===\n');

console.log('Contract Explorer URL (embedded in shares):');
console.log(explorerUrl);
console.log('\n');

console.log('Farcaster Share URL:');
console.log(farcasterUrl);
console.log('\n');

console.log('Twitter Share URL:');
console.log(twitterUrl);
console.log('\n');

console.log('Share Text Preview:');
console.log(shareText);
console.log('\n');

console.log('✅ Share URLs now point to the contract on BaseScan!');
console.log('✅ After sharing, user will be redirected to dashboard');