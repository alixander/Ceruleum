import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  allFiles: List(),
  displayedFile: null
});

export default function files(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'REFRESH_FILES':
      console.log('switching data');
      return state.merge({
        allFiles: List(action.data)
      });
    case 'DISPLAY_FILE':
      return state.merge({
        displayedFile: action.data
      });
    default:
      return state;
  }
}
