import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Display.css';
import Code from './Code';

export class Display extends Component {
  constructor() {
    super();
    this.state = {
      animatingEnter: true
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.filename && nextProps.filename) {
      this.setState({
        filename: nextProps.filename
      });
    } else if (nextProps.filename !== this.props.filename) {
      this.setState({
        animatingEnter: false
      });
      setTimeout(() => {
        this.setState({
          filename: nextProps.filename
        });
      }, 100);
      setTimeout(() => {
        this.setState({
          animatingEnter: true
        });
      }, 200);
    }
  }

  render() {
    if (!this.props.filename) {
      return null;
    }

    const animationStyles = this.state.animatingEnter ?
      '' : styles.titleAnimate;

    const codeWindow = this.props.isUnifiedView ?
      <Code /> :
      [<Code isOld={true} />, <Code isOld={false} />];

    return (
      <div className={styles.container}>
        <div className={styles.title}>
          <div className={`${styles.word} ${animationStyles}`}>
            {this.state.filename}
          </div>
        </div>
        <div className={styles.window}>
          {codeWindow}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const props = {};
  props.filename = state.files.get('displayedFile').get('path')
  props.isUnifiedView = state.view.get('isUnified');
  return props;
}

export default connect(mapStateToProps, {
})(Display);
