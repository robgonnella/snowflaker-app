import * as C from '../constants';

export function setMode(mode: string): AppAction.SetAppMode {
  return {
    type: C.SET_MODE,
    mode
  }
}

export function setSnowflakeCsv(path: string): AppAction.SetSnowflakeCsv {
  return {
    type: C.SET_SNOWFLAKE_CSV_PATH,
    path
  }
}

export function setQaCsv(path: string): AppAction.SetQaCsv {
  return {
    type: C.SET_QA_CSV_PATH,
    path
  }
}

export function setTargetPath(path: string): AppAction.SetTargetPath {
  return {
    type: C.SET_TARGET_DIR_PATH,
    path
  }
}

export function resetApp() {
  return {
    type: C.RESET_APP
  }
}
