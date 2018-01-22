import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SnowflakerContainer from './views/snowflaker/snowflaker-container';
import 'styles/main.scss';

ReactDOM.render(
  <SnowflakerContainer />,
  document.getElementById('app-mount')
);
