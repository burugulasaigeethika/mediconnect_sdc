# Frontend Integration Guide - Razorpay Payments

## Overview
This guide shows how to integrate the backend payment APIs with your existing frontend UI **without modifying any UI elements**.

---

## Step 1: Add Razorpay Script to HTML

Add this script tag to your main HTML file (e.g., `index.html`):

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Step 2: Payment Flow Implementation

### When User Clicks "Pay Now" Button

Update your existing payment button's onClick handler:

```javascript
const handlePayNow = async (orderId) => {
  try {
    // 1. Create Razorpay order
    const response = await fetch('http://localhost:5000/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    const data = await response.json();

    // 2. Configure Razorpay options
    const options = {
      key: data.keyId, // Razorpay key from backend
      amount: data.amount, // Amount in paise
      currency: data.currency,
      order_id: data.razorpayOrderId,
      name: 'MediConnect',
      description: `Order ${orderId}`,
      image: '/logo.png', // Your app logo
      handler: async function(razorpayResponse) {
        // 3. Payment successful - verify on backend
        await verifyPayment(orderId, razorpayResponse);
      },
      modal: {
        ondismiss: async function() {
          // 4. User closed payment modal
          await handlePaymentFailure(orderId, { description: 'Payment cancelled by user' });
        }
      },
      theme: {
        color: '#3399cc' // Match your app theme
      }
    };

    // 3. Open Razorpay checkout
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', async function(response) {
      // Handle payment failure
      await handlePaymentFailure(orderId, response.error);
    });

    rzp.open();

  } catch (error) {
    console.error('Payment initialization error:', error);
    alert('Failed to initialize payment. Please try again.');
  }
};
```

---

## Step 3: Verify Payment

```javascript
const verifyPayment = async (orderId, razorpayResponse) => {
  try {
    const response = await fetch('http://localhost:5000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        orderId: orderId
      })
    });

    const data = await response.json();

    if (data.success) {
      // Payment verified successfully!
      alert('Payment successful! Order ID: ' + orderId);
      // Redirect to success page or refresh order status
      window.location.href = '/orders/' + orderId;
    } else {
      alert('Payment verification failed. Please contact support.');
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    alert('Payment verification failed. Please contact support.');
  }
};
```

---

## Step 4: Handle Payment Failures

```javascript
const handlePaymentFailure = async (orderId, error) => {
  try {
    await fetch('http://localhost:5000/api/payments/failure', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: orderId,
        error: {
          code: error.code || 'PAYMENT_FAILED',
          description: error.description || 'Payment failed',
          reason: error.reason || 'Unknown'
        }
      })
    });

    // Show user-friendly error message
    alert('Payment failed. You can try again from your orders page.');
    
  } catch (error) {
    console.error('Error logging payment failure:', error);
  }
};
```

---

## Step 5: Check Payment Status

Optional - Check payment status of an order:

```javascript
const getPaymentStatus = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/payments/status/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    return {
      paymentStatus: data.paymentStatus, // 'pending', 'completed', 'failed'
      paymentMethod: data.paymentMethod, // 'cash', 'online'
      paidAt: data.paidAt,
      totalAmount: data.totalAmount
    };

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return null;
  }
};
```

---

## React Example

```jsx
import React, { useState } from 'react';

const PaymentButton = ({ orderId, amount }) => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    
    try {
      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      // Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        order_id: data.razorpayOrderId,
        name: 'MediConnect',
        description: `Order Payment - ${orderId}`,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId
            })
          });

          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            alert('Payment successful!');
            window.location.reload();
          }
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={initiatePayment} 
      disabled={loading}
      className="your-existing-button-class"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default PaymentButton;
```

---

## Testing with Test Cards

Use these test cards in Razorpay Checkout:

### Successful Payment
- **Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Failed Payment
- **Card**: 4000 0000 0000 0002

### Insufficient Funds
- **Card**: 4000 0000 0000 9995

More test cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

## Error Handling

```javascript
// Common error scenarios

// 1.  Network error
if (!response.ok) {
  if (response.status === 401) {
    // User not authenticated
    window.location.href = '/login';
  } else if (response.status === 404) {
    // Order not found
    alert('Order not found');
  } else if (response.status === 503) {
    // Payment service not configured
    alert('Payment service unavailable. Please contact support.');
  }
}

// 2. Rate limiting
if (response.status === 429) {
  const data = await response.json();
  alert(`Too many payment attempts. Please try again in ${Math.ceil(data.retryAfter / 60)} minutes.`);
}

// 3. Razorpay errors
rzp.on('payment.failed', function(response) {
  console.error('Razorpay error:', response.error);
  alert(`Payment failed: ${response.error.description}`);
});
```

---

## Important Notes

1. **No UI Changes Required** - Use your existing buttons, modals, and styles
2. **Token Required** - All payment APIs require authentication
3. **HTTPS Required** - Razorpay only works on HTTPS (or localhost for testing)
4. **Test Mode** - Use Razorpay test keys during development
5. **Retry Support** - Failed payments can be retried (order remains in same state)

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/create-order` | POST | Initialize payment |
| `/api/payments/verify` | POST | Verify completed payment |
| `/api/payments/failure` | POST | Log payment failure |
| `/api/payments/status/:orderId` | GET | Check payment status |

---

## Support

For issues:
1. Check browser console for errors
2. Verify authentication token is valid
3. Ensure Razorpay script is loaded
4. Check backend logs for payment errors
5. Verify Razorpay credentials in backend `.env`
