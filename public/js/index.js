import '@babel/polyfill';
import { login } from './login';

const attachEventListener = (elId, action, handler) => {
  document.getElementById(elId).addEventListener(action, handler);
};

const getElement = elId => {
  return document.getElementById(elId);
};

if (getElement('form')) {
  const loginHandler = async e => {
    e.preventDefault();
    const email = getElement('email').value;
    const password = getElement('password').value;
    await login(email, password);
  };

  attachEventListener('form', 'submit', loginHandler);
}
