import axios from 'axios';
import { showAlert } from './alert';

export const signup = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'To complete signup, check your email for confirmation link.'
      );
      return res.data.status;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const confirmSignup = async token => {
  try {
    const res = await axios(`/api/v1/users/confirmAccount/${token}`);
    if (res.data.status === 'success') location.reload();
  } catch (err) {
    location.assign('/error');
  }
};
