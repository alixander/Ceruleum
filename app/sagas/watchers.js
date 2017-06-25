import { takeEvery, spawn } from 'redux-saga/effects'

import Workers from './workers';

function* watchRefreshFiles() {
  yield takeEvery('REFRESH_FILES_INTENT', Workers.refreshFiles);
}

function* watchDisplayFile() {
  yield takeEvery('DISPLAY_FILE_INTENT', Workers.displayFile);
}

function* start() {
  yield spawn(watchRefreshFiles);
  yield spawn(watchDisplayFile);
}

export default start;
