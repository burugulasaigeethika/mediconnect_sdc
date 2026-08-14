# MediConnect - Redis & Razorpay Setup Guide

## Quick Start Guide

### Prerequisites

1. **Redis Server** - Install and run Redis locally or use a Redis cloud service
2. **Razorpay Account** - Sign up at https://razorpay.com and get API keys

---

## Step 1: Install Redis

### Option A: Windows (Using WSL or MSI)
```bash
# Using WSL (Windows Subsystem for Linux)
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start

# OR download Redis for Windows:
# https://github.com/microsoftarchive/redis/releases
```

### Option B: macOS
```bash
brew install redis
brew services start redis
```

### Option C: Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Option D: Docker
```bash
docker run -d -p 6379:6379 --name mediconnect-redis redis:latest
```

### Verify Redis is Running
```bash
redis-cli ping
# Expected output: PONG
```

---

## Step 2: Configure Environment Variables

1. Copy the `.env.example` to `.env` in the backend directory:
```bash
cd backend
copy .env.example .env
```

2. Update the `.env` file with your credentials:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_TLS=false

# Razorpay Payment Gateway
# Get these from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
ENABLE_PAYMENT=true
```

### Getting Razorpay Credentials

1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate **Test Mode** keys for development
4. Copy **Key ID** and **Key Secret** to your `.env` file

---

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `ioredis` (^5.3.2) - Redis client
- `razorpay` (^2.9.2) - Razorpay SDK

---

## Step 4: Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Expected startup logs:
```
🔄 Initializing Redis...
✅ MongoDB connected successfully
✅ Redis connected successfully
✅ Redis is ready

==================================================
🚀 MediConnect Server (Restarted)
==================================================
📍 Environment: development
🌐 Server running on port 5000
📧 Email service: ✅ Enabled
💳 Payment service: ✅ Enabled
🔄 Redis: ✅ Connected
==================================================
```

---

## Step 5: Test the Integration

### Test Redis Connection
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MediConnect API is running",
  "environment": "development",
  "features": {
    "email": true,
    "payment": true,
    "redis": true
  }
}
```

### Test Logout Endpoint
```bash
# First login to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Then logout with the token
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Rate Limiting
```bash
# Make 6+ rapid login requests to trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}';
done
```

After 5 attempts, you should get:
```json
{
  "message": "Too many login attempts. Please try again in 15 minutes.",
  "retryAfter": 900
}
```

---

## Step 6: Test Payment Flow

### 1. Create a Test Order
First, create an order in your database (via existing endpoints).

### 2. Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORD123456"}'
```

Response:
```json
{
  "success": true,
  "razorpayOrderId": "order_MnKwK...",
  "amount": 50000,
  "currency": "INR",
  "orderId": "ORD123456",
  "keyId": "rzp_test_..."
}
```

### 3. Use Razorpay Test Cards

When testing in Razorpay Checkout, use these test card numbers:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`

Razorpay Test Documentation: https://razorpay.com/docs/payments/payments/test-card-details/

---

## Troubleshooting

### Redis Connection Failed

**Error**: `⚠️ Redis connection failed - app will run without caching`

**Solutions**:
1. Check if Redis is running:
   ```bash
   redis-cli ping
   ```
2. Verify `REDIS_URL` in `.env` matches your Redis instance
3. If using remote Redis, ensure firewall allows connection

**Note**: App will still function without Redis, but without caching benefits.

---

### Razorpay Not Configured

**Error**: `Razorpay is not configured. Please add credentials to .env file.`

**Solutions**:
1. Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`
2. Remove placeholder values (`your_razorpay_key_id`)
3. Use **Test Mode** keys for development
4. Restart the server after updating `.env`

---

### Payment Signature Verification Failed

**Error**: `Payment verification failed. Invalid signature.`

**Causes**:
- Using wrong `RAZORPAY_KEY_SECRET`
- Mismatched `razorpay_order_id` or `razorpay_payment_id`
- Signature tampering

**Solution**:
- Double-check your Razorpay credentials
- Ensure frontend sends correct response from Razorpay
- Check Razorpay dashboard for actual payment details

---

### Rate Limit Errors

**Error**: `Too many requests, please try again later`

This is expected behavior! Rate limiting is working correctly.

**Solutions**:
- Wait for the retry period (shown in `retryAfter` field)
- Use different IP/email for testing
- Temporarily adjust limits in `redisRateLimiter.js` for development

---

## Redis Monitoring

### View All Keys
```bash
redis-cli KEYS "*"
```

### View OTP Data
```bash
redis-cli GET "otp:user@example.com"
```

### View Rate Limits
```bash
redis-cli GET "ratelimit:login:192.168.1.1:user@example.com"
```

### Clear All Cache
```bash
redis-cli FLUSHDB
```

---

## Production Checklist

Before deploying to production:

- [ ] Replace Razorpay **Test** keys with **Live** keys
- [ ] Update `REDIS_URL` if using remote Redis
- [ ] Set `REDIS_PASSWORD` for production Redis
- [ ] Enable Redis TLS (`REDIS_TLS=true`) for cloud Redis
- [ ] Set `NODE_ENV=production`
- [ ] Review and adjust rate limits in `redisRateLimiter.js`
- [ ] Set up Redis persistence (AOF or RDB snapshots)
- [ ] Configure Redis memory limits
- [ ] Set up monitoring for Redis and Razorpay

---

## Support

- **Redis Documentation**: https://redis.io/docs/
- **Razorpay Docs**: https://razorpay.com/docs/
- **MediConnect API**: Check `API_DOCUMENTATION.md` in the project root

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Start Redis server
3. ✅ Test the integration
4. 🔜 Integrate frontend with payment endpoints
5. 🔜 Test end-to-end payment flow with UI
6. 🔜 Deploy to staging environment
