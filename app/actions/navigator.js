export function refreshFiles() {
  return { type: 'REFRESH_FILES_INTENT' };
}

export function setRootDirectory(directoryName) {
  return {
    type: 'SET_ROOT_DIRECTORY',
    data: directoryName
  };
}

export function displayFile(file) {
  return {
    type: 'DISPLAY_FILE_INTENT',
    data: file
  };
}

export function toggleFolderDisplay(file) {
  return {
    type: 'TOGGLE_FOLDER',
    data: file
  };
}

export default {
  refreshFiles,
  displayFile,
  toggleFolderDisplay,
  setRootDirectory
};
