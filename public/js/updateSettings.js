import axios from 'axios';
import { showAlert } from './alert';

// type is either "password" or "data"
export const updateUserSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `Your ${type} is Updated Successfully`);
      return res.data.status;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
