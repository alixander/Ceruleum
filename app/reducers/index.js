import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import files from './files';
import view from './view';

const rootReducer = combineReducers({
  files,
  view,
  router,
});

export default rootReducer;
