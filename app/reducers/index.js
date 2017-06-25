import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import files from './files';

const rootReducer = combineReducers({
  files,
  router,
});

export default rootReducer;
