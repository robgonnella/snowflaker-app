import * as React from 'react';
import * as C from '../../constants';

export interface SnowflakerProps {
  setMode: (mode: string) => void;
  reset: () => void;
  partialReset: () => void;
  undo: () => void;
  setTargetPath: (path: string) => void;
  setSnowflakeCsv: (path: string) => void;
  setQaCsv: (path: string) => void;
  appMode: string;
  snowflakeCsvPath: string;
  qaCsvPath: string;
  targetDirPath: string;
  output: string[];
}

export default function SnowFlaker(props: SnowflakerProps): JSX.Element {
  switch(props.appMode) {
    case C.MAIN_PORTAL:
      return renderPortal(props);
    default:
      return renderDragNDrop(props);
  }
}

function renderDragNDrop(props: SnowflakerProps) {
  let titles = [];
  let snowCsv = props.snowflakeCsvPath;
  let qaCsv = props.qaCsvPath;
  let targetPath = props.targetDirPath;
  let output: JSX.Element[] | '' = '';
  if (props.output.length) {
    output = props.output.map((line, idx) => {
      return <pre key={idx}> {line} </pre>;
    });
  }
  const firstTitle = props.appMode === C.QA_MAP_MODE
    ? 'Drag and drop QA CSV to window'
    : 'Drag and drop Snowflake CSV to window';
  const secTitle = props.appMode === C.QA_MAP_MODE
    ? 'Drag and drop Snowflake CSV to window'
    : 'Drag and drop target directory';
  titles.push(firstTitle);
  titles.push(secTitle)
  titles = titles.map((t, i) => {
    const hide = (i === 1 && !(snowCsv || qaCsv)) ? 'hide' : '';
    return <h1 key={i} className={`drag-n-drop-title ${hide}`}> {t} </h1>
  });
    return (
      <div className='title-container'>
        <div className='top-button-container'>
          <div
            onClick={props.reset}
            className='back-btn'>
            ←
          </div>
          { renderUndo(props) }
          <div
            onClick={props.partialReset}
            className='partial-reset-btn'>
            Reset
          </div>
        </div>
        {titles}
        <div className='output'>
          {output}
        </div>
      </div>
    );
}

function renderUndo(props: SnowflakerProps) {
  const snowflakerMode = props.appMode === C.SNOWFLAKERIZE_MODE;
  const prependQaMode = props.appMode === C.PREPEND_QA_MODE;
  const hasSnow = props.snowflakeCsvPath.length;
  const hasTarget = props.targetDirPath.length;
  const show = (snowflakerMode || prependQaMode) && (hasSnow && hasTarget)
    ? 'show'
    : '';
  return (
    <div className={`undo-btn ${show}`} onClick={props.undo}> Undo </div>
  );
}

function renderPortal(props: SnowflakerProps) {
  return (
    <div id='main-window'>
      <div id='logo'/>
      <h1> What would you like to do? </h1>
      <div className='app-option'>
        <div className='option-label'>Start a new project </div>
        <div
          className='inline-button'>
          New project
        </div>
        <div className='description'>
          Coming soon...
          This will create a new project where you can generate
          unique names for files using a custom formula or using one of
          snowflaker's built in formulas. You can also generate and store
          csv mappings for later conversions.
        </div>
      </div>
      <div className='app-option'>
        <div className='option-label'>Snowflakerize </div>
        <div
          onClick={props.setMode.bind(this, C.SNOWFLAKERIZE_MODE)}
          className='inline-button'>
          Snowflakerize
        </div>
        <div className='description'>
          Use this option to rename files according to a given csv mapping.
        </div>
      </div>
      <div className='app-option'>
        <div className='option-label'>Map origin names to QA CSV </div>
        <div
          onClick={props.setMode.bind(this, C.QA_MAP_MODE)}
          className='inline-button'>
          Map Origin to QA
        </div>
        <div className='description'>
          Use this options to re-generate QA csv with origin map column.
        </div>
      </div>
      <div className='app-option'>
        <div className='option-label'>Prepend QA files with origin name </div>
        <div
          onClick={props.setMode.bind(this, C.PREPEND_QA_MODE)}
          className='inline-button'>
          Prepend QA with Origin
        </div>
        <div className='description'>
          Use this option to prepend QA files with origin name followed
          by underscore e.g. 45_QA-name.
        </div>
      </div>
    </div>
  );
}
