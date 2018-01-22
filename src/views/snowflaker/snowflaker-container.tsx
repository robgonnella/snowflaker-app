import * as React from 'react';
import Snowflaker from './snowflaker';

export default class SnowflakerContainer
  extends React.Component<{}, {}> {

  constructor(props: {}) {
    super(props)
  }

  public render(): JSX.Element {
    return <Snowflaker />;
  }
}
