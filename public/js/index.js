import { login, logout } from './login';
import { updateUserSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

const attachEventListener = (elSelector, action, handler) => {
  document.querySelector(elSelector).addEventListener(action, handler);
};

const getElement = elSelector => {
  return document.querySelector(elSelector);
};

if (getElement('.form--login')) {
  const loginHandler = async e => {
    e.preventDefault();
    const email = getElement('#email').value;
    const password = getElement('#password').value;
    await login(email, password);
  };

  attachEventListener('.form--login', 'submit', loginHandler);
}

if (getElement('.nav__el--logout')) {
  attachEventListener('.nav__el--logout', 'click', logout);
}

if (getElement('.form-user-data')) {
  const updateDataHandler = async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await updateUserSettings(data, 'data');
  };

  const updatePassHandler = async e => {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(e.currentTarget)]);
    e.currentTarget.reset();
    await updateUserSettings(data, 'password');
  };
  attachEventListener('.form-user-data', 'submit', updateDataHandler);
  attachEventListener('.form-user-settings', 'submit', updatePassHandler);
}

if (getElement('#book-tour')) {
  const bookTourHandler = async e =>
    await bookTour(e.currentTarget.dataset.tourId);
  attachEventListener('#book-tour', 'click', bookTourHandler);
}

const alertMsg = getElement('body').dataset.alert;
if (alertMsg) showAlert('success', alertMsg);
