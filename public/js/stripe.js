import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51LrHPxIhnYPvSEUkRzkvVVwgahU9uKRfe50hdFCLBtyge9zevpHLQb0swHDnejHyOTdKQ5wVTM0aRehIZdx9Vrnr00RIaguQdc'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
