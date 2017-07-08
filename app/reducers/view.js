import { List, Map } from 'immutable';

const INITIAL_STATE = Map({
  isUnified: false
});

export default function files(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'TOGGLE_VIEW':
      if (state.get('isUnified')) {
        return state.merge({
          isUnified: false
        });
      }
      return state.merge({
        isUnified: true
      });
    default:
      return state;
  }
}
