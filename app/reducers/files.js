import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  allFiles: List(),
  folded: List(),
  displayedFile: Map(),
  isError: false,
  rootDirectory: ''
});

export default function files(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SET_ROOT_DIRECTORY':
      return state.merge({
        rootDirectory: action.data,
        displayedFile: Map(),
        folded: List(),
        allFiles: List()
      });
    case 'TOGGLE_FOLDER':
      if (state.get('folded').includes(action.data)) {
        return state.merge({
          folded: state.get('folded').filter((dir) => dir !== action.data)
        })
      }
      return state.merge({
        folded: state.get('folded').push(action.data)
      });
    case 'REFRESH_FILES':
      if (action.data.isError) {
        return state.merge({
          isError: true
        });
      }
      return state.merge({
        allFiles: List(action.data),
        isError: false
      });
    case 'DISPLAY_FILE_INTENT':
      const newState = state.merge({
        displayedFile: state.get('displayedFile').set('path', action.data.path)
      });
      return newState;
    case 'DISPLAY_FILE':
      return state.merge({
        displayedFile: action.data
      });
    default:
      return state;
  }
}
