import { put, call, select } from 'redux-saga/effects'

import { exec } from 'child_process';
import Utils from '../utils/utils';

function getFileDiffOutput(filePath) {
  return new Promise((resolve, reject) => {
    const path = '/Users/alixander/dev/marco/';
    exec(`git diff HEAD ${filePath}`, { cwd: path }, (err, stdout, ederr) => {
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
    const path = '/Users/alixander/dev/marco/';
    exec('git diff HEAD --name-only', { cwd: path }, (err, stdout, ederr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  })
}

function* parseFiles(files) {
  let filenamesList = files.split('\n');
  // The last line always empty line
  filenamesList = filenamesList.slice(0, filenamesList.length - 1);
  const formattedData = [];
  for (let i = 0; i < filenamesList.length; i++) {
    const filename = filenamesList[i];
    const splitFilePath = filename.split('/');
    let dataPointer = formattedData;
    for (let filePathSectionIndex = 0; filePathSectionIndex < splitFilePath.length; filePathSectionIndex++) {
      const filePathSection = splitFilePath[filePathSectionIndex];
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
          path: splitFilePath.slice(0, filePathSectionIndex + 1).join('/'),
          children: []
        };
        const isNoFileDisplayed = !(yield select(Utils.isAnyFileDisplayed));
        const isNewDataNonDirectory = filePathSection.includes('.');
        if (isNoFileDisplayed && isNewDataNonDirectory) {
          yield call(displayFile, {data: newData});
        }
        dataPointer.push(newData);
        dataPointer = newData.children;
      }
    }
  }
  return formattedData;
}

export function* refreshFiles() {
  const diffedFilenames = yield call(getDiffFilenames);
  const parsedFilenames = yield call(parseFiles, diffedFilenames);
  yield put({
    type: 'REFRESH_FILES',
    data: parsedFilenames
  })
}

function getTypeFromLine(line) {
  if (line.startsWith('-')) {
    return 'old';
  } else if (line.startsWith('+')) {
    return 'new';
  }
  return null;
}

function isLineSectionHeader(line) {
  return line.startsWith('@@') &&
    (line.indexOf('@@') !== line.lastIndexOf('@@'));
}

function getDiffStarts(line) {
  const relevantWords = line.split(' ').slice(1, 3);
  const output = {};

  if (!relevantWords[0].includes(',')) {
    const oldDiffStart = relevantWords[0].substring(1, relevantWords[0].length);
    output.oldDiffStart = parseInt(oldDiffStart);
    output.oldDiffLineCount = 0;
  } else {
    const oldDiffStart = relevantWords[0].substring(1, relevantWords[0].indexOf(','));
    output.oldDiffStart = parseInt(oldDiffStart);
    const oldDiffLineCount = relevantWords[0].substring(relevantWords[0].indexOf(',') + 1, relevantWords[0].length);
    output.oldDiffLineCount = parseInt(oldDiffLineCount);
  }

  if (!relevantWords[1].includes(',')) {
    const newDiffStart = relevantWords[1].substring(1, relevantWords[1].length);
    output.newDiffStart = parseInt(newDiffStart);
    output.newDiffLineCount = 0;
  } else {
    const newDiffStart = relevantWords[1].substring(1, relevantWords[1].indexOf(','));
    output.newDiffStart = parseInt(newDiffStart);
    const newDiffLineCount = relevantWords[1].substring(relevantWords[1].indexOf(',') + 1, relevantWords[1].length);
    output.newDiffLineCount = parseInt(newDiffLineCount);
  }

  return output;
}

function parseDiff(diff) {
  const diffSections = [];
  const splitDiff = diff.split('\n');
  // Ignore the first few metadata lines
  for (const line of splitDiff.slice(splitDiff.findIndex((diff) => diff.startsWith('@@')), splitDiff.length - 1)) {
    // Line used for parsing could be different than raw line
    let usedLine = line;
    if (isLineSectionHeader(line)) {
      const newSection = {
        metaData: {},
        lines: []
      };
      diffSections.push(newSection);
      const sectionMetadata = getDiffStarts(line);
      newSection.metaData.oldDiffIndex = sectionMetadata.oldDiffStart;
      newSection.metaData.oldDiffMaxIndex = newSection.metaData.oldDiffIndex + sectionMetadata.oldDiffLineCount;
      newSection.metaData.newDiffIndex = sectionMetadata.newDiffStart;
      newSection.metaData.newDiffMaxIndex = newSection.metaData.newDiffIndex + sectionMetadata.newDiffLineCount;
      usedLine = line.substring(line.lastIndexOf('@') + 1, line.length);
    }
    const type = getTypeFromLine(usedLine);

    const section = diffSections[diffSections.length - 1];
    section.lines.push(usedLine);
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
      lines: parsedDiff,
      path: file.path
    }
  })
}

export default {
  refreshFiles,
  displayFile
};
