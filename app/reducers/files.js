import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  allFiles: List(),
  folded: List(),
  displayedFile: Map()
});

export default function files(state = INITIAL_STATE, action) {
  switch (action.type) {
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
