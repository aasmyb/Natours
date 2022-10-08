import axios from 'axios';
import { showAlert } from './alert';

export const updateMe = async (email, name) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: { email, name },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Data Updated Successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
