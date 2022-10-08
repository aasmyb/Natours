import { login, logout } from './login';

const attachEventListener = (elSelector, action, handler) => {
  document.querySelector(elSelector).addEventListener(action, handler);
};

const getElement = elSelector => {
  return document.querySelector(elSelector);
};

if (getElement('#form')) {
  const loginHandler = async e => {
    e.preventDefault();
    const email = getElement('#email').value;
    const password = getElement('#password').value;
    await login(email, password);
  };

  attachEventListener('#form', 'submit', loginHandler);
}

if (getElement('.nav__el--logout')) {
  attachEventListener('.nav__el--logout', 'click', logout);
}
