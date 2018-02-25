import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';
const projectDir = process && process.type === 'renderer' ?
  electron.remote.app.getPath('userData') :
  electron.app.getPath('userData');

const projectsPath = path.join(projectDir, 'saved-projects.json');

export interface projectConfig {
  snowflakeCsv: string;
  qaCsv?: string;
}

type configKeys = keyof projectConfig;

export interface SavedProjectsJSON {
  projectList: string[];
  details: {
    [projectName: string]: projectConfig;
  }
}

const defaults: SavedProjectsJSON = {
  projectList: [],
  details: {}
};

export function initialize(): SavedProjectsJSON | void {
  if (!fs.existsSync(projectsPath)) {
    return writeProjectsFile(defaults);
  }
}

export function restoreToDefaults(): SavedProjectsJSON | void {
  return writeProjectsFile(defaults);
}

export function getProjectsList(): SavedProjectsJSON["projectList"] | void {
  const data = readProjectsFile();
  if (data) {
    return data.projectList;
  }
}

export function addProject(
  projectName: string,
  config: projectConfig
): SavedProjectsJSON | void {
  let data = readProjectsFile();
  if (data && !data.projectList.includes(projectName)) {
    data.projectList.unshift(projectName);
    data.details[projectName] = config;
    return writeProjectsFile(data);
  }
}

export function removeProject(
  projectName: string
): SavedProjectsJSON | void {
  let data = readProjectsFile();
  if (data) {
    data.projectList = data.projectList.filter((p: string) => {
      return p !== projectName;
    });
    delete data.details[projectName];
    return writeProjectsFile(data);
  }
}

export function getProjectKey(
  projectName: string,
  key: configKeys
): string | void {
  const data = readProjectsFile();
  if (data && data.details[projectName]) {
    return data.details[projectName][key];
  }
}

export function updateProjectKey(
  projectName: string,
  key: configKeys,
  value: string
): SavedProjectsJSON | void {
  let data = readProjectsFile();
  if (data && data.details[projectName]) {
    data.details[projectName][key] = value;
    writeProjectsFile(data);
  }
}

export function readProjectsFile(): SavedProjectsJSON | void {
  if (fs.existsSync(projectsPath)) {
    try {
      const data: SavedProjectsJSON = JSON.parse(
        fs.readFileSync(projectsPath, 'utf-8')
      );
      return data;
    } catch (e) {
      console.log('Error reading saved projects file: ' + e.message);
    }
  }
}

export function writeProjectsFile(
  data: SavedProjectsJSON
): SavedProjectsJSON | void {
  try {
    fs.writeFileSync(projectsPath, JSON.stringify(data));
    return data;
  } catch(e) {
    console.log('Error writing to saved projects file: ' + e.message);
  }
}
