export function isAnyFileDisplayed(state) {
  return state.files.get('displayedFile') && state.files.get('displayedFile').size !== 0;
}

export function getNumDigits(num) {
  return num.toString().length;
}

export function getCurrentRootDirectory(state) {
  return state.files.get('rootDirectory');
}

export default {
  isAnyFileDisplayed,
  getCurrentRootDirectory,
  getNumDigits
};
