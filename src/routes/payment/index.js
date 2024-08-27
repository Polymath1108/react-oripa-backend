const express = require('express');
const router = express.Router();
// Import your payment gateway SDK (e.g., Stripe)

router.post('/strip', async (req, res) => {
  const { cardNumber, expiryDate, cvv, nameOnCard } = req.body;

  try {
    // Call the payment gateway API to process the payment
    // For example, using Stripe:
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // Amount in cents
      currency: 'usd',
      payment_method_data: {
        card: {
          number: cardNumber,
          exp_month: expiryDate.split('/')[0],
          exp_year: `20${expiryDate.split('/')[1]}`,
          cvc: cvv,
        },
        billing_details: {
          name: nameOnCard,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment failed' });
  }
});

module.exports = router;