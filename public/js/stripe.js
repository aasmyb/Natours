import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {
  try {
    const stripe = Stripe(
      'pk_test_51LrHPxIhnYPvSEUkRzkvVVwgahU9uKRfe50hdFCLBtyge9zevpHLQb0swHDnejHyOTdKQ5wVTM0aRehIZdx9Vrnr00RIaguQdc'
    );
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
