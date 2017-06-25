import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Code.css';
import ReactDOM from 'react-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles';

export class Code extends Component {
  processLines(section) {
    const combined = section.get('unchanged').concat(
      this.props.isOld ? section.get('old') : section.get('new')
    );
    const sorted = combined.sort((a, b) => {
      return a.get('lineNum') < b.get('lineNum') ? 0 : 1;
    });
    const lines = [];
    for (const line of sorted) {
      lines.push(line.get('line'));
    }
    return lines.join('\n');
  }

  renderCode() {
    const sectionElements = [];
    for (let i = 0; i < this.props.lines.size; i++) {
      sectionElements.push(
        <SyntaxHighlighter language='javascript' style={docco} key={i}>
          {this.processLines(this.props.lines.get(i))}
        </SyntaxHighlighter>
      );
    }
    return sectionElements;
  }

  render() {
    if (!this.props.lines) {
      return null;
    }

    return (
      <div className={styles.container}>
        <div className={styles.title}>Code</div>
        {this.renderCode()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const displayedFile = state.files.get('displayedFile');
  const props = {};
  if (displayedFile) {
    props.lines = state.files.get('displayedFile').get('lines');
  }
  return props;
}

export default connect(mapStateToProps, {
})(Code);
