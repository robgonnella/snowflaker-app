import * as React from 'react';
import Snowflaker from './snowflaker';
import * as Electron from 'electron';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { exec } from 'child_process';
import * as path from 'path';
import Snowflakerizer from '../../lib/snowflaker';
import {
  setMode,
  resetApp,
  setTargetPath,
  setSnowflakeCsv,
  setQaCsv } from '../../actions';
import * as C from '../../constants';

const appPath = Electron.remote.app.getAppPath();
const appPathDir = path.dirname(appPath);
const isDev = process.env.NODE_ENV === 'development';
const execPath = isDev
  ? '"./dist/bin/snowflaker"'
  : `"${appPathDir}/snowflaker"`;

export interface SnowflakerContainerProps {
  setMode: (mode: string) => void;
  resetApp: () => void;
  setTargetPath: (path: string) => void;
  setSnowflakeCsv: (path: string) => void;
  setQaCsv: (path: string) => void;
  appMode: string;
  snowflakeCsvPath: string;
  qaCsvPath: string;
  targetDirPath: string;
}

export interface SnowflakerState {
  output: string[];
}

class SnowflakerContainer
  extends React.Component<SnowflakerContainerProps, SnowflakerState> {

    private snowflakerizer: Snowflakerizer | undefined

    constructor(props: SnowflakerContainerProps) {
      super(props)
      this.snowflakerizer = undefined;
      this.state = this.getInitialState();
    }

    private getInitialState = () => {
      return {
        output: [],
      };
    }

    public componentDidMount() {
      document.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      });

      document.addEventListener('drop', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        const files = event.dataTransfer.files;
        if (files.length !== 1) { return false; }
        const path = files[0].path
        switch(this.props.appMode) {
          case C.SNOWFLAKERIZE_MODE:
            return this.props.snowflakeCsvPath
              ? this.props.setTargetPath(path)
              : this.props.setSnowflakeCsv(path);
          case C.QA_MAP_MODE:
            return this.props.qaCsvPath
              ? this.props.setSnowflakeCsv(path)
              : this.props.setQaCsv(path);
          case C.PREPEND_QA_MODE:
            return this.props.snowflakeCsvPath
              ? this.props.setTargetPath(path)
              : this.props.setSnowflakeCsv(path);
        }
      });
    }

    public async componentDidUpdate(
      prevProps: SnowflakerContainerProps,
      prevState: SnowflakerState
    ) {
      if (this.state.output.length) { return null; }
      const appMode = this.props.appMode;
      const snflkCsvPath = this.props.snowflakeCsvPath;
      const qaCsvPath = this.props.qaCsvPath;
      const targetDirPath = this.props.targetDirPath;
      let output: string[] = [];

      if (snflkCsvPath) {
        this.snowflakerizer = new Snowflakerizer(snflkCsvPath);
        await this.snowflakerizer.init()
      }

      switch(appMode) {
        case C.SNOWFLAKERIZE_MODE:
          if (this.snowflakerizer && targetDirPath) {
            output = await this.snowflakerizer.snowflakerize(targetDirPath);
          }
          break;
        case C.QA_MAP_MODE:
          if (qaCsvPath && this.snowflakerizer) {
            output = await this.snowflakerizer.genQaMap(qaCsvPath);
          }
          break;
        case C.PREPEND_QA_MODE:
          if (targetDirPath && this.snowflakerizer) {
            output = await this.snowflakerizer.prependWithOrigin(targetDirPath);
          }
          break;
        default:
          break;
      }

      if (output.length) {
        this.setState({output});
      }

    }

    public render(): JSX.Element {
      const props = {
        ...this.state,
        ...this.props,
        reset: this.reset,
        partialReset: this.partialReset,
        undo: this.undo
      };
      return <Snowflaker {...props} />;
    }

    private reset = () => {
      this.snowflakerizer = undefined;
      this.setState(this.getInitialState());
      this.props.resetApp();
    }

    private partialReset = () => {
      const mode = this.props.appMode;
      this.setState(this.getInitialState());
      this.props.resetApp();
      this.props.setMode(mode);
    }

    private undo = async () => {
      const mode = this.props.appMode;
      const targetDirPath = this.props.targetDirPath;
      let output: string[] = [];
      switch(mode) {
        case C.SNOWFLAKERIZE_MODE:
          if (this.snowflakerizer && targetDirPath) {
            output = await this.snowflakerizer.unsnowflakerize(targetDirPath);
          }
          break;
        case C.PREPEND_QA_MODE:
          if (this.snowflakerizer && targetDirPath) {
            output = await this.snowflakerizer.undoPrepend(targetDirPath);
          }
          break;
      }

      if (output.length) {
        this.setState({output});
      }
    }

}

const mapStateToProps = function(state: Snowflaker.State) {
  return { ...state };
}

const mapDispatchToProps = function(
  dispatch: Redux.Dispatch<Snowflaker.State>
) {
  return {
    setMode: (mode: string): void => { dispatch(setMode(mode)); },
    resetApp: (): void => { dispatch(resetApp()); },
    setTargetPath: (path: string): void => { dispatch(setTargetPath(path)); },
    setSnowflakeCsv: (path: string): void => { dispatch(setSnowflakeCsv(path)); },
    setQaCsv: (path: string): void => { dispatch(setQaCsv(path)); }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SnowflakerContainer);
