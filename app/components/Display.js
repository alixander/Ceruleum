import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Display.css';
import Code from './Code';

export class Display extends Component {
  render() {
    if (!this.props.filename) {
      return null;
    }

    return (
      <div className={styles.container}>
        <div className={styles.title}>Display {this.props.filename}</div>
        <div className={styles.window}>
          <Code isOld={true} />
          <Code isOld={false} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const displayedFile = state.files.get('displayedFile');
  const props = {};
  if (displayedFile) {
    props.filename = state.files.get('displayedFile').get('name')
  }
  return props;
}

export default connect(mapStateToProps, {
})(Display);
