import { combineReducers } from 'redux';
import * as C from '../constants';


const initial: Snowflaker.State = {
  appMode: C.MAIN_PORTAL,
  snowflakeCsvPath: '',
  qaCsvPath: '',
  targetDirPath: ''
}

function appMode(
  state = initial.appMode,
  action: AppAction.SetAppMode
): string {
  switch(action.type) {
    case C.SET_MODE:
      return action.mode;
    case C.RESET_APP:
      return initial.appMode;
    default:
      return state;
  }
}

function snowflakeCsvPath(
  state = initial.snowflakeCsvPath, action: AppAction.SetSnowflakeCsv
): string {
  switch(action.type) {
    case C.SET_SNOWFLAKE_CSV_PATH:
      return action.path;
    case C.RESET_APP:
      return initial.snowflakeCsvPath;
    default:
      return state;
  }
}

function qaCsvPath(
  state = initial.qaCsvPath,
  action: AppAction.SetQaCsv
): string {
  switch(action.type) {
    case C.SET_QA_CSV_PATH:
      return action.path;
    case C.RESET_APP:
      return initial.qaCsvPath;
    default:
      return state;
  }
}

function targetDirPath(
  state = initial.targetDirPath,
  action: AppAction.SetTargetPath
): string {
  switch(action.type) {
    case C.SET_TARGET_DIR_PATH:
      return action.path;
    case C.RESET_APP:
      return initial.targetDirPath;
    default:
      return state;
  }
}

const Root = combineReducers({
  appMode,
  snowflakeCsvPath,
  qaCsvPath,
  targetDirPath
});

export default Root;
