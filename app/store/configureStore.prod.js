import { createStore, applyMiddleware } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga'
import rootReducer from '../reducers';
import sagas from '../sagas/watchers'

const history = createBrowserHistory();

function configureStore(initialState) {
  const router = routerMiddleware(history);

  const sagaMiddleware = createSagaMiddleware();
  const enhancer = applyMiddleware(router, sagaMiddleware);

  const store = createStore(rootReducer, initialState, enhancer);
  sagaMiddleware.run(sagas);
  return store;
}

export default { configureStore, history };
