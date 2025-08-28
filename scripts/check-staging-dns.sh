#!/bin/bash

echo "🔍 Checking DNS configuration for staging.base-hodl.xyz"
echo "================================================"
echo ""

# Check CNAME record
echo "📡 Checking CNAME record..."
dig_output=$(dig staging.base-hodl.xyz CNAME +short 2>/dev/null)

if [ -n "$dig_output" ]; then
    echo "✅ CNAME found: $dig_output"
    
    if [[ "$dig_output" == *"vercel"* ]]; then
        echo "✅ Points to Vercel infrastructure"
    else
        echo "⚠️  CNAME doesn't point to Vercel"
        echo "   Expected: cname.vercel-dns.com."
    fi
else
    echo "❌ No CNAME record found"
    echo "   You need to add CNAME record pointing to: cname.vercel-dns.com."
fi

echo ""
echo "🌐 Checking if domain resolves..."
ip_output=$(dig staging.base-hodl.xyz A +short 2>/dev/null | head -1)

if [ -n "$ip_output" ]; then
    echo "✅ Domain resolves to: $ip_output"
else
    echo "❌ Domain doesn't resolve to an IP yet"
    echo "   DNS propagation might still be in progress"
fi

echo ""
echo "🔒 Checking HTTPS accessibility..."
response=$(curl -Is https://staging.base-hodl.xyz 2>/dev/null | head -1)

if [[ "$response" == *"200"* ]] || [[ "$response" == *"308"* ]] || [[ "$response" == *"301"* ]]; then
    echo "✅ Site is accessible via HTTPS"
    echo "   Response: $response"
elif [[ "$response" == *"404"* ]]; then
    echo "⚠️  Domain configured but deployment might be missing"
    echo "   Response: $response"
elif [ -n "$response" ]; then
    echo "⚠️  Unexpected response: $response"
else
    echo "❌ Cannot reach https://staging.base-hodl.xyz yet"
    echo "   This is normal if DNS was just configured"
fi

echo ""
echo "================================================"
echo "📝 Next Steps:"
echo ""

if [[ "$dig_output" != *"vercel"* ]]; then
    echo "1. Add CNAME record in your DNS provider:"
    echo "   - Name: staging"
    echo "   - Type: CNAME"
    echo "   - Value: cname.vercel-dns.com."
    echo ""
fi

echo "2. In Vercel dashboard:"
echo "   https://vercel.com/ivan-singabytes-projects/base-hodl-staging/settings/domains"
echo "   - Add domain: staging.base-hodl.xyz"
echo "   - Wait for verification (5-30 minutes)"
echo ""
echo "3. DNS propagation can take up to 48 hours (usually 5-30 minutes)"
echo ""
echo "Run this script again in a few minutes to check progress."