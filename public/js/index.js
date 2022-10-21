import { login, logout } from './login';
import { updateUserSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { confirmSignup, signup } from './signup';
import { forgotPassword, resetPassword } from './forgotPassword';

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

  const updatePassHandler = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(this)]);
    const res = await updateUserSettings(data, 'password');
    if (res === 'success') this.reset();
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

// Handle signup
if (getElement('.form--signup')) {
  const signupHandler = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(this)]);
    const res = await signup(data);
    if (res === 'success') this.reset();
  };

  attachEventListener('.form--signup', 'submit', signupHandler);
}

// Handle account confirmation
if (location.pathname.startsWith('/signup/confirm/')) {
  const [token] = location.pathname.split('/').slice(-1);

  // Confirm user isn't logged in yet
  if (!getElement('.nav__el--logout')) {
    (async () => await confirmSignup(token))();
  }
}

// Handle forget password
if (getElement('.form--forget-password')) {
  const forgetPasswordHandler = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(this)]);
    const res = await forgotPassword(data.email);
    if (res === 'success') this.reset();
  };

  attachEventListener(
    '.form--forget-password',
    'submit',
    forgetPasswordHandler
  );
}

// Handle password reset
if (getElement('.form--reset-password')) {
  const forgetPasswordHandler = async function (e) {
    const [token] = location.pathname.split('/').slice(-1);
    e.preventDefault();
    const data = Object.fromEntries([...new FormData(this)]);
    const res = await resetPassword(data.password, data.passwordConfirm, token);
    if (res === 'success') this.reset();
  };

  attachEventListener('.form--reset-password', 'submit', forgetPasswordHandler);
}
