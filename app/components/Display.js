import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Display.css';
import Code from './Code';
import { toggleView } from '../actions/view';
import SunIcon from 'react-icons/lib/ti/weather-sunny';
import MoonIcon from 'react-icons/lib/ti/weather-night';

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
    } else if (nextProps.filename && (nextProps.filename !== this.props.filename)) {
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

  renderErrorPrompt() {
    return (
      <div className={styles.errorPrompt}>
        Oops, something went wrong! Make sure to select a directory with a Git history.
      </div>
    );
  }

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
      return this.renderErrorPrompt();
    }
    if (!this.props.filename) {
      return null;
    }

    const animationStyles = this.state.animatingEnter ?
      '' : styles.titleAnimate;

    const codeWindow = this.props.isUnifiedView ?
      <Code key='unified' /> :
      [<Code isOld={true} key='old'/>, <Code isOld={false} key='new'/>];

    const extraContainerStyles = {
      width: this.props.width - 10,
      marginLeft: window.innerWidth - this.props.width
    };

    return (
      <div className={styles.container} style={extraContainerStyles}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={`${styles.word} ${animationStyles}`}>
              {this.state.filename}
            </div>
          </div>
          <div className={styles.options}>
            <div className={styles.viewToggle}>
              <div className={styles.switch}>
                <input type='radio' id='option-one' name='selector' defaultChecked={this.props.isUnifiedView ? false : true} />
                <label htmlFor='option-one' className={styles.leftLabel} onClick={() => this.toggleView(true)}>Split</label>
                <input type='radio' id='option-two' name='selector' defaultChecked={this.props.isUnifiedView ? true : false} />
                <label htmlFor='option-two' className={styles.rightLabel} onClick={() => this.toggleView(false)}>Unified</label>
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

function mapStateToProps(state) {
  const props = {};
  props.filename = state.files.get('displayedFile').get('path')
  props.isUnifiedView = state.view.get('isUnified');
  props.isError = state.files.get('isError');
  return props;
}

export default connect(mapStateToProps, {
  toggleView
})(Display);
