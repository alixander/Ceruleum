import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Home.css';
import Navigator from './Navigator';
import Display from './Display';

export class Home extends Component {
  constructor() {
    super();
    this.state = {
      width: 200
    };
  }

  componentDidMount() {
    this.props.refreshFiles();
  }

  onMouseDown() {
    this.setState({
      resizing: true
    });
  }

  onMouseMove(e) {
    if (!this.state.resizing) {
      return;
    }
    this.setState({
      resizing: true,
      width: Math.min(e.screenX - 20, 0.9 * window.innerWidth)
    });
  }

  onMouseUp() {
    this.setState({
      resizing: false
    });
  }

  onMouseLeave() {
    this.setState({
      resizing: false
    });
  }

  render() {
    const extraStyles = {
      maxWidth: window.innerWidth,
      height: window.innerHeight - 20
    };

    const extraResizerStyles = {
      width: this.state.resizing ? '500rem' : '0.8rem',
      left: this.state.resizing ? 0 : this.state.width + 20
    };

    return (
      <div className={styles.container} style={extraStyles}>
        <div className={styles.content}>
          <Navigator width={this.state.width} />
          <div
            onMouseDown={(e) => this.onMouseDown(e)}
            onMouseUp={(e) => this.onMouseUp(e)}
            onMouseMove={(e) => this.onMouseMove(e)}
            onMouseLeave={(e) => this.onMouseLeave(e)}
            className={styles.resizer}
            style={extraResizerStyles}
          />
          <Display width={window.innerWidth - this.state.width - 20} />
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  refreshFiles: PropTypes.func.isRequired
};

export default Home;
