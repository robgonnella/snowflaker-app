import * as React from 'react';

export default function SnowFlaker(): JSX.Element {
  return (
    <div id='main-window'>
      <div id='logo'/>
      <h1> What would you like to do? </h1>
      <div className='app-option'>
        <div className='option-label'>Start a new project </div>
        <div className='inline-button'>New project</div>
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
        <div className='inline-button'>Snowflakerize</div>
        <div className='description'>
          Use this option to rename files according to a given csv mapping file.
        </div>
      </div>
      <div className='app-option'>
        <div className='option-label'>Map origin names to QA CSV </div>
        <div className='inline-button'>Map Origin to QA </div>
        <div className='description'>
          Use this options to generate a new csv mapping based on
        </div>
      </div>
      <div className='app-option'>
        <div className='option-label'>Prepend QA files with origin name </div>
        <div className='inline-button'>Prepend QA with Origin</div>
        <div className='description'>
          Use this option to prepend QA files with origin name followed
          by underscore e.g. 45_QA-name.
        </div>
      </div>
    </div>
  );
}
