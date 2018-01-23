import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import SnowflakerContainer from './views/snowflaker/snowflaker-container';
import App from './reducers';
import 'styles/main.scss';

const store = createStore(App);

ReactDOM.render(
  <Provider store={store}>
    <SnowflakerContainer />
  </Provider>,
  document.getElementById('app-mount')
);
