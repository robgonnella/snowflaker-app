import * as React from 'react';
import Snowflaker from './snowflaker';
import * as Electron from 'electron';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { exec } from 'child_process';
import * as path from 'path';
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
  processing: boolean;
}

class SnowflakerContainer
  extends React.Component<SnowflakerContainerProps, SnowflakerState> {

  constructor(props: SnowflakerContainerProps) {
    super(props)
    this.state = this.getInitialState();
  }

  private getInitialState = () => {
    return {
      output: [],
      processing: false
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

  public componentDidUpdate(
    prevProps: SnowflakerContainerProps,
    prevState: SnowflakerState
  ) {
    const appMode = this.props.appMode;
    const snflkCsvPath = this.props.snowflakeCsvPath;
    const qaCsvPath = this.props.qaCsvPath;
    const targetDirPath = this.props.targetDirPath;
    let option = '';
    let arg1 = '';
    let arg2 = '';

    switch(appMode) {
      case C.SNOWFLAKERIZE_MODE:
        if (snflkCsvPath && targetDirPath) {
          option = '-s';
          arg1 = snflkCsvPath;
          arg2 = targetDirPath;
        }
        break;
      case C.QA_MAP_MODE:
        if (qaCsvPath && snflkCsvPath) {
          option = '-m';
          arg1 = qaCsvPath;
          arg2 = snflkCsvPath;
        }
        break;
      case C.PREPEND_QA_MODE:
        if (snflkCsvPath && targetDirPath) {
          option = '-q';
          arg1 = snflkCsvPath;
          arg2 = targetDirPath;
        }
        break;
      default:
        break;
    }
    if (option && arg1 && arg2 && !this.state.processing) {
      this.setState({processing: true})

      exec(
        `${execPath} ${option} ${arg1} ${arg2}`,
        (err, stdout, stderr) => {
          if (err) {
            let error = stderr.split("\n");
            this.setState({output: error});
          } else if (stdout) {
            let output = stdout.split("\n");
            this.setState({output: output});
          }
        }
      );
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
    this.setState(this.getInitialState());
    this.props.resetApp();
  }

  private partialReset = () => {
    const mode = this.props.appMode;
    this.setState(this.getInitialState());
    this.props.resetApp();
    this.props.setMode(mode);
  }

  private undo = () => {
    const mode = this.props.appMode;
    const arg1 = this.props.snowflakeCsvPath;
    const arg2 = this.props.targetDirPath;
    let option = '';
    let output = [];
    switch(mode) {
      case C.SNOWFLAKERIZE_MODE:
        option = '-u';
        break;
      case C.PREPEND_QA_MODE:
        option = '-z';
        break
    }

    if (arg1 && arg2 && option) {
      this.setState({processing: true});
      exec(
        `${execPath} ${option} ${arg1} ${arg2}`,
        (err, stdout, stderr) => {
          if (err) {
            output = stderr.split("\n");
            this.setState({output: output});
          } else {
            output = stdout.split("\n");
            this.setState({output: output});
          }
        }
      );
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
