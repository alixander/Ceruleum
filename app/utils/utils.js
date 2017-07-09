export function isAnyFileDisplayed(state) {
  return state.files.get('displayedFile') && state.files.get('displayedFile').size !== 0;
}

export function getNumDigits(num) {
  return num.toString().length;
}

export function getCurrentRootDirectory(state) {
  return state.files.get('rootDirectory');
}

function isOldLine(line) {
  return line.startsWith('-');
}

function isNewLine(line) {
  return line.startsWith('+');
}

export default {
  isAnyFileDisplayed,
  getCurrentRootDirectory,
  getNumDigits,
  isOldLine,
  isNewLine
};
