import { connect } from 'react-redux';

import Home from '../components/Home';
import { refreshFiles } from '../actions/navigator';

function mapStateToProps(state) {
  return {
    files: state.files
  };
}

export default connect(mapStateToProps, {
  refreshFiles
})(Home);
