import { put, call } from 'redux-saga/effects'

import { exec } from 'child_process';

function getFileDiffOutput(filePath) {
  return new Promise((resolve, reject) => {
    const path = '/Users/alixander/dev/Stanchion/';
    console.log(filePath);
    exec(`git diff ${filePath}`, { cwd: path }, (err, stdout, ederr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

function getDiffFilenames() {
  return new Promise((resolve, reject) => {
    const path = '/Users/alixander/dev/Stanchion/';
    exec('git diff --name-only', { cwd: path }, (err, stdout, ederr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  })
}

function parseFiles(files) {
  let filenamesList = files.split('\n');
  // The last line always empty line
  filenamesList = filenamesList.slice(0, filenamesList.length - 1);
  const formattedData = [];
  for (let i = 0; i < filenamesList.length; i++) {
    const filename = filenamesList[i];
    const splitFilePath = filename.split('/');
    let dataPointer = formattedData;
    for (const filePathSection of splitFilePath) {
      let matchingDir = null;
      for (const childData of dataPointer) {
        if (childData.name === filePathSection) {
          matchingDir = childData;
        }
      }
      if (matchingDir) {
        dataPointer = matchingDir.children;
      } else {
        const newData = {
          name: filePathSection,
          path: filename,
          children: []
        };
        dataPointer.push(newData);
        dataPointer = newData.children;
      }
    }
  }
  return formattedData;
}

export function* refreshFiles() {
  const diffedFilenames = yield call(getDiffFilenames);
  const parsedFilenames = parseFiles(diffedFilenames);
  yield put({
    type: 'REFRESH_FILES',
    data: parsedFilenames
  })
}

function parseDiff(diff) {
  const diffSections = [];
  let lineCounter = 0;
  for (const line of diff.split('\n')) {
    if (line.includes('@@')) {
      const newSection = {
        old: [],
        new: [],
        unchanged: []
      };
      lineCounter = 0;
      diffSections.push(newSection);
    } else if (line.startsWith('- ')) {
      diffSections[diffSections.length-1].old.push({
        line, lineNum: lineCounter
      });
      lineCounter += 1;
    } else if (line.startsWith('+ ')) {
      diffSections[diffSections.length-1].new.push({
        line, lineNum: lineCounter
      });
      lineCounter += 1;
    } else if (line.startsWith(' ')) {
      diffSections[diffSections.length-1].unchanged.push({
        line, lineNum: lineCounter
      });
      lineCounter += 1;
    }
  }
  return diffSections;
}

export function* displayFile(action) {
  const file = action.data;
  const diffOutput = yield call(getFileDiffOutput, file.path);
  const parsedDiff = parseDiff(diffOutput);
  yield put({
    type: 'DISPLAY_FILE',
    data: {
      name: file.name,
      lines: parsedDiff
    }
  })
}

export default {
  refreshFiles,
  displayFile
};
