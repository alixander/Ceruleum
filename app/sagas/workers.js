import { put, call, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import { exec } from 'child_process';
import Utils from '../utils/utils';

function getFileDiffOutput(filePath, rootDirectory) {
  return new Promise((resolve, reject) => {
    exec(`git diff HEAD -- ${filePath}`, { cwd: rootDirectory }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

function getDiffFilenames(rootDirectory) {
  return new Promise((resolve, reject) => {
    exec('git diff HEAD --name-only', { cwd: rootDirectory }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Input: newline delimited paths of files changed
// Output: tree structure json with name, path, and children as properties of each node
function* parseFiles(filesGitOutput) {
  let filenamesList = filesGitOutput.split('\n');
  // The last line always empty line
  filenamesList = filenamesList.slice(0, filenamesList.length - 1);
  const root = { children: [] };
  for (let i = 0; i < filenamesList.length; i += 1) {
    const filename = filenamesList[i];
    const splitFilePath = filename.split('/');
    let dataPointer = root.children;
    for (let filePathSectionIndex = 0; filePathSectionIndex < splitFilePath.length; filePathSectionIndex += 1) {
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
          yield call(displayFile, { data: newData });
        }
        dataPointer.push(newData);
        dataPointer = newData.children;
      }
    }
  }
  return root;
}

export function* onSetRootDirectory() {
  yield put({ type: 'REFRESH_FILES_INTENT' });
}

export function* refreshFiles() {
  const path = yield select(Utils.getCurrentRootDirectory);
  if (!path) {
    return;
  }
  try {
    const diffedFilenames = yield call(getDiffFilenames, path);
    const parsedFilenamesRoot = yield call(parseFiles, diffedFilenames);
    yield put({
      type: 'REFRESH_FILES',
      data: parsedFilenamesRoot.children
    });
  } catch (error) {
    yield put({
      type: 'REFRESH_FILES',
      data: { isError: true }
    });
  }
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
    output.oldDiffStart = parseInt(oldDiffStart, 10);
    output.oldDiffLineCount = 0;
  } else {
    const oldDiffStart = relevantWords[0].substring(1, relevantWords[0].indexOf(','));
    output.oldDiffStart = parseInt(oldDiffStart, 10);
    const oldDiffLineCount = relevantWords[0].substring(relevantWords[0].indexOf(',') + 1, relevantWords[0].length);
    output.oldDiffLineCount = parseInt(oldDiffLineCount, 10);
  }

  if (!relevantWords[1].includes(',')) {
    const newDiffStart = relevantWords[1].substring(1, relevantWords[1].length);
    output.newDiffStart = parseInt(newDiffStart, 10);
    output.newDiffLineCount = 0;
  } else {
    const newDiffStart = relevantWords[1].substring(1, relevantWords[1].indexOf(','));
    output.newDiffStart = parseInt(newDiffStart, 10);
    const newDiffLineCount = relevantWords[1].substring(relevantWords[1].indexOf(',') + 1, relevantWords[1].length);
    output.newDiffLineCount = parseInt(newDiffLineCount, 10);
  }

  return output;
}

function parseDiff(gitOutputDiff) {
  const diffSections = [];
  const splitDiff = gitOutputDiff.split('\n');
  // Ignore the first few metadata lines
  for (const line of splitDiff.slice(splitDiff.findIndex((diff) => diff.startsWith('@@')), splitDiff.length - 1)) {
    if (isLineSectionHeader(line)) {
      const newSection = {
        metaData: {},
        lines: []
      };
      diffSections.push(newSection);
      const sectionMetadata = getDiffStarts(line);
      newSection.metaData.oldDiffIndex = sectionMetadata.oldDiffStart;
      newSection.metaData.oldDiffMaxIndex = newSection.metaData.oldDiffIndex +
        sectionMetadata.oldDiffLineCount;
      newSection.metaData.newDiffIndex = sectionMetadata.newDiffStart;
      newSection.metaData.newDiffMaxIndex = newSection.metaData.newDiffIndex +
        sectionMetadata.newDiffLineCount;
    } else {
      const section = diffSections[diffSections.length - 1];
      section.lines.push(line);
    }
  }
  return diffSections;
}

export function* displayFile(action) {
  const path = yield select(Utils.getCurrentRootDirectory);
  if (!path) {
    return;
  }
  const file = action.data;
  const diffOutput = yield call(getFileDiffOutput, file.path, path);
  const parsedDiff = parseDiff(diffOutput);
  console.log('firing actual action');
  yield put({
    type: 'DISPLAY_FILE',
    data: {
      name: file.name,
      lines: parsedDiff,
      path: file.path
    }
  });
}

export default {
  refreshFiles,
  displayFile,
  onSetRootDirectory
};
