export function refreshFiles() {
  return { type: 'REFRESH_FILES_INTENT' };
}

export function displayFile(file) {
  return {
    type: 'DISPLAY_FILE_INTENT',
    data: file
  }
}

export default {
  refreshFiles,
  displayFile
};
