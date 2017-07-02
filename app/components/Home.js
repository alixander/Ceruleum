import React, { Component } from 'react';
import { refreshFiles } from '../actions/navigator';
import { Link } from 'react-router-dom';
import styles from './Home.css';
import Navigator from './Navigator';
import Display from './Display';

export default class Home extends Component {
  componentDidMount() {
    this.props.refreshFiles();
  }

  render() {
    const extraStyles = {
      maxWidth: window.innerWidth,
      height: window.innerHeight - 20
    };
    return (
      <div className={styles.container} style={extraStyles}>
        <div className={styles.content}>
          <Navigator />
          <Display />
        </div>
      </div>
    );
  }
}
