import { takeEvery, spawn } from 'redux-saga/effects';

import Workers from './workers';

function* watchRefreshFiles() {
  yield takeEvery('REFRESH_FILES_INTENT', Workers.refreshFiles);
}

function* watchDisplayFile() {
  yield takeEvery('DISPLAY_FILE_INTENT', Workers.displayFile);
}

function* watchSetRootDirectory() {
  yield takeEvery('SET_ROOT_DIRECTORY', Workers.onSetRootDirectory);
}

function* start() {
  yield spawn(watchRefreshFiles);
  yield spawn(watchSetRootDirectory);
  yield spawn(watchDisplayFile);
}

export default start;
