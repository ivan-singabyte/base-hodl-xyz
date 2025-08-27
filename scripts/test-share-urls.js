// Test script to verify share URL generation

const tokenSymbol = 'WETH';
const amount = '0.5';
const duration = '30 days';
const unlockDate = new Date('2025-09-26');

const shareText = `Just locked ${amount} ${tokenSymbol} for ${duration}! 💎🙌

Unlock date: ${unlockDate.toLocaleDateString()}

No paper hands allowed until then. Join me on HODL Vault!`;

const appUrl = 'http://localhost:3001';
const shareUrl = appUrl;

// Farcaster URL
const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`;

// Twitter URL  
const twitterText = `${shareText}\n\n${shareUrl}`;
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

console.log('Farcaster Share URL:');
console.log(farcasterUrl);
console.log('\n');

console.log('Twitter Share URL:');
console.log(twitterUrl);
console.log('\n');

console.log('Share Text Preview:');
console.log(shareText);