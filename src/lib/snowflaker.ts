import * as csvtojson from 'csvtojson';
import * as jsontocsv from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';

export interface ComplexMap {
  [key: string]: any;
}

export interface SimpleMap {
  [key: string]: string
}

export interface SnowflakerizerOpts {
  csvPath: string;
}

export default class Snowflakerizer {
  private csvPath = '';
  private map: SimpleMap = {};
  private reverseMap: SimpleMap = {};
  private qaData: ComplexMap[] = [];
  private converter: csvtojson.Converter;

  constructor(csvPath: string) {
    this.csvPath = csvPath;
  }

  public async init() {
    this.map = await this.createSimpleMap(this.csvPath);
    this.reverseMap = this.createReverseMap(this.map);
  }

  public snowflakerize(targetDir: string): Promise<string[]> {
    console.log('snowflakerizing');
    let output: string[] = [];
    let msg = '';
    return new Promise((resolve, reject) => {
      fs.readdir(targetDir, (err, files) => {
        if (err) { return reject(err); }
        files.forEach((file) => {
          let ext = path.extname(file);
          let key = file.replace(ext, '');
          if (key && this.map[key]) {
            const oldPath = targetDir + '/' + file;
            const newName = this.map[key] + ext;
            const newPath = targetDir + '/' + newName;
            msg = `renaming ${file}\n      ------> ${newName}\n`;
            output.push(msg);
            fs.renameSync(oldPath, newPath);
          } else {
            msg = `skipping file: ${file}`;
            output.push(msg);
          }
        });
        resolve(output);
      });
    });
  }

  public unsnowflakerize(targetDir: string): Promise<string[]> {
    console.log('unsnowflakerizing');
    let output: string[] = [];
    let msg = '';
    return new Promise((resolve, reject) => {
      fs.readdir(targetDir, (err, files) => {
        if (err) { return reject(err); }
        files.forEach((file) => {
          const ext = path.extname(file);
          const key = file.replace(ext, '');
          if (key && this.reverseMap[key]) {
            const oldPath = targetDir + '/' + file;
            const newName = this.reverseMap[key] + ext;
            const newPath = targetDir + '/' + newName;
            msg = `renaming ${file} -----> ${newName}`;
            output.push(msg);
            fs.renameSync(oldPath, newPath);
          } else {
            msg = `skipping file: ${file}`;
            output.push(msg);
          }
        });
        resolve(output);
      });
    });
  }

  public genQaMap(qaCsv: string): Promise<string[]> {
    console.log('generating new qa map with origin column')
    return new Promise(async (resolve, reject) => {
      let output: string[] = [];
      const outPath: string = (
        path.dirname(qaCsv) + '/' + 'qa-origin-mapping.csv'
      );
      this.qaData = await this.getQaData(qaCsv);
      if (!this.qaData.length) {
        return reject('Could not get data from csv');
      }
      let keys = Object.keys(this.qaData[0])
      keys.push('Origin');
      const mappingOutput = this.updateQaDataWithOrigin();
      output = output.concat(mappingOutput);
      const csv = jsontocsv({ data: this.qaData, fields: keys });
      fs.writeFileSync(outPath, csv);
      const divider = "================================";
      const finalMsg = "Mapping can be found at: " + outPath;
      output.unshift("");
      output.unshift(divider);
      output.unshift(finalMsg);
      output.unshift(divider);
      resolve(output);
    });
  }

  public prependWithOrigin(targetDir: string): Promise<string[]> {
    console.log('prepending files with origin');
    const regexSnow = /[Pp]\d{4}/;
    const regexBegin = /^\d+_/;
    let output: string[] = [];
    return new Promise((resolve, reject) => {
      fs.readdir(targetDir, (err, files) => {
        if (err) { return reject(err); }
        for (let file of files) {
          if (regexBegin.test(file)) { continue; }
          const pName = file.match(regexSnow);
          if (!pName || !pName.length) { continue; }
          const fileId = file.split('_')[6];
          const candidate = pName + '_' + fileId;
          if (this.reverseMap[candidate]) {
            const origin = this.reverseMap[candidate];
            const newName = `${origin}_${file}`;
            const oldPath = targetDir + '/' + file;
            const newPath = targetDir + '/' + newName;
            let msg = `prepending origin: ${origin} to file: ${file}`;
            output.push(msg);
            fs.renameSync(oldPath, newPath);
          }
        }
        resolve(output);
      });
    });
  }

  public undoPrepend(targetDir: string): Promise<string[]> {
    console.log('removing prepended origins from file names')
    const prependRegex = /^\d+_/;
    let output: string[] = [];
    return new Promise((resolve, reject) => {
      fs.readdir(targetDir, (err, files) => {
        if (err) { return reject(err); }
        for (let file of files) {
          let parts = file.split('_');
          let origin = parts[0];
          if (!prependRegex.test(file)) { continue; }
          parts.shift();
          const oldPath = targetDir + '/' + file;
          const newName = parts.join('_');
          const newPath = targetDir + '/' + newName;
          let msg = `Removing prepended origin: ${origin} from file: ${file}`;
          output.push(msg);
          fs.renameSync(oldPath, newPath);
        }
        resolve(output);
      });
    });
  }

  private updateQaDataWithOrigin(): string[] {
    const regexSnow = /[Pp]\d{4}/;
    const regexBegin = /^RAW/;
    const output: string[] = [];
    for (let obj of this.qaData) {
      obj.Origin = '';
      const filename = obj['File name'];
      const ext = path.extname(filename);
      const pName = filename.match(regexSnow);
      if (!pName || !pName.length) { continue; }
      const fileId = filename.split('_')[6];
      if (!regexBegin.test(filename)) { continue; }
      if (!pName.length) { continue; }
      const candidate = pName[0] + '_' + fileId;
      if (this.reverseMap[candidate]) {
        const origin = this.reverseMap[candidate] + ext;
        let msg = `Mapped ${filename} to: ${origin}`;
        output.push(msg);
        obj.Origin = origin;
      }
    }
    return output;
  }

  private createSimpleMap(path: string): Promise<SimpleMap> {
    if (this.converter) { delete this.converter; }
    this.converter = new csvtojson.Converter({
      noheader: true,
      ignoreEmpty: true,
      flatKeys: true
    });
    return new Promise((resolve, reject) => {
      let map: SimpleMap = {};
      this.converter.fromFile(path, (err: Error, result: SimpleMap[]) => {
        if (err) {
          return reject(err);
        }
        for(let obj of result) {
          map[obj.field1] = obj.field2;
        }
        resolve(map);
      });
    });
  }

  private getQaData(path: string): Promise<ComplexMap[]> {
    if (this.converter) { delete this.converter; }
    this.converter = new csvtojson.Converter({
      noheader: false,
      ignoreEmpty: false,
      flatKeys: true
    });
    return new Promise((resolve, reject) => {
      this.converter.fromFile(path, (err: Error, result: ComplexMap[]) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  private createReverseMap(map: SimpleMap): SimpleMap {
    let reverseMap: SimpleMap = {};
    for (let key in map) {
      reverseMap[map[key]] = key;
    }
    return reverseMap;
  }
}
