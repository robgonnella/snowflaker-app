
declare module Snowflaker {
  interface State {
    appMode: string
    snowflakeCsvPath: string;
    qaCsvPath: string;
    targetDirPath: string;
  }
}

declare module AppAction {

  interface SetAppMode {
    type: string;
    mode: string;
  }

  interface SetSnowflakeCsv {
    type: string;
    path: string;
  }

  interface SetQaCsv {
    type: string;
    path: string;
  }

  interface SetTargetPath {
    type: string;
    path: string;
  }

  interface Reset {
    type: string;
  }
}
