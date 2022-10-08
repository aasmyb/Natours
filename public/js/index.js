import { login, logout } from './login';
import { updateMe } from './updateSettings';

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
  const updateMeHandler = async e => {
    e.preventDefault();
    const arrData = [...new FormData(e.currentTarget)];
    const data = Object.fromEntries(arrData);
    await updateMe(data.email, data.name);
  };
  attachEventListener('.form-user-data', 'submit', updateMeHandler);
}
