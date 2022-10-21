import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: { email },
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'To complete the process, check your email for password reset link.'
      );
    }
    return res.data.status;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: { password, passwordConfirm },
    });
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Password was changed successfully! You are now logged in and will be redirected!'
      );
      setTimeout(() => {
        location.assign('/');
      }, 2500);
    }
    return res.data.status;
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
