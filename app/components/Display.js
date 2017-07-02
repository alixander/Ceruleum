import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
// @TODO: For night/day mode feature
// import SunIcon from 'react-icons/lib/ti/weather-sunny';
// import MoonIcon from 'react-icons/lib/ti/weather-night';

import styles from './Display.css';
import Code from './Code';
import { toggleView } from '../actions/view';

function renderErrorPrompt() {
  return (
    <div className={styles.errorPrompt}>
      Oops, something went wrong! Make sure to select a directory with a Git history.
    </div>
  );
}

export class Display extends Component {
  toggleView(isTogglingToSplit) {
    // Don't do anything if already split
    if (isTogglingToSplit && this.props.isUnifiedView) {
      this.props.toggleView();
      return;
    }
    if (!isTogglingToSplit && !this.props.isUnifiedView) {
      this.props.toggleView();
    }
  }

  render() {
    if (this.props.isError) {
      return renderErrorPrompt();
    }
    if (!this.props.filename) {
      return null;
    }

    const codeWindow = this.props.isUnifiedView ?
      <Code key='unified' /> :
      [<Code isOld={true} key='old' />, <Code isOld={false} key='new' />];

    const extraContainerStyles = {
      width: this.props.width - 10,
      marginLeft: window.innerWidth - this.props.width
    };

    return (
      <div className={styles.container} style={extraContainerStyles}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ReactCSSTransitionGroup
              transitionName={{
                enter: styles.enter,
                enterActive: styles.enterActive,
                leave: styles.leave,
                leaveActive: styles.leaveActive
              }}
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}>
            <div className={styles.word} key={this.props.filename}>
              {this.props.filename}
            </div>
            </ReactCSSTransitionGroup>
          </div>
          <div className={styles.options}>
            <div className={styles.viewToggle}>
              <div className={styles.switch}>
                <input type='radio' id='option-one' name='selector' defaultChecked={!this.props.isUnifiedView} />
                <label htmlFor='option-one' className={styles.leftLabel} onClick={() => this.toggleView(true)}>
                  Split
                </label>
                <input type='radio' id='option-two' name='selector' defaultChecked={this.props.isUnifiedView} />
                <label htmlFor='option-two' className={styles.rightLabel} onClick={() => this.toggleView(false)}>
                  Unified
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.window}>
          {codeWindow}
        </div>
      </div>
    );
  }
}

Display.propTypes = {
  filename: PropTypes.string,
  isError: PropTypes.bool.isRequired,
  isUnifiedView: PropTypes.bool.isRequired,
  toggleView: PropTypes.func.isRequired,
  width: PropTypes.number
};

function mapStateToProps(state) {
  const props = {};
  props.filename = state.files.get('displayedFile').get('path');
  props.isUnifiedView = state.view.get('isUnified');
  props.isError = state.files.get('isError');
  props.lines = state.files.getIn(['displayedFile', 'lines']);
  return props;
}

export default connect(mapStateToProps, {
  toggleView
})(Display);
