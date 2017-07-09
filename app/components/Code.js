import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github as syntaxStyle } from 'react-syntax-highlighter/dist/styles';

import styles from './Code.css';
import Utils from '../utils/utils';

function renderFillerLine() {
  return '';
}

export class Code extends Component {
  constructor() {
    super();
    this.oldLineTypes = {};
    this.newLineTypes = {};
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.lines !== this.props.lines) ||
      (nextProps.isUnifiedView !== this.props.isUnifiedView)) {
      this.oldLineTypes = {};
      this.newLineTypes = {};
    }
  }

  getLineStyle(lineNum, sectionIndex) {
    const oldLineStyle = {
      background: '#FFEEF0'
    };
    const newLineStyle = {
      background: '#E6FFED'
    };

    if (this.props.isOld || this.props.isUnifiedView) {
      if (this.oldLineTypes[sectionIndex] &&
        this.oldLineTypes[sectionIndex].includes(lineNum - 1)) {
        return oldLineStyle;
      }
    }
    if (!this.props.isOld || this.props.isUnifiedView) {
      if (this.newLineTypes[sectionIndex] &&
        this.newLineTypes[sectionIndex].includes(lineNum - 1)) {
        return newLineStyle;
      }
    }
    return {};
  }

  getLineNumberStyle(lineNum, sectionIndex) {
    const oldLineStyle = {
      background: 'black !important'
    };
    const newLineStyle = {
      background: 'blue'
    };

    if (this.oldLineTypes[sectionIndex] &&
      this.oldLineTypes[sectionIndex].includes(lineNum - 1)) {
      return oldLineStyle;
    }
    if (this.newLineTypes[sectionIndex] &&
      this.newLineTypes[sectionIndex].includes(lineNum - 1)) {
      return newLineStyle;
    }

    return {};
  }

  processOldSection(section, sectionIndex) {
    const output = [];
    const sectionLines = section.get('lines');
    const sectionMetaData = section.get('metaData');
    let currentIndex = 0;
    let paddingCount = 0;
    const startIndex = sectionMetaData.get('oldDiffIndex');
    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex += 1) {
      const line = sectionLines.get(lineIndex);
      if (Utils.isNewLine(line)) {
        paddingCount += 1;
      } else if (Utils.isOldLine(line)) {
        if (!this.oldLineTypes[sectionIndex]) {
          this.oldLineTypes[sectionIndex] = [];
        }
        this.oldLineTypes[sectionIndex].push(output.length);
        paddingCount -= 1;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      } else {
        for (let padding = 0; padding < paddingCount; padding += 1) {
          output.push(renderFillerLine());
        }
        paddingCount = 0;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      }
    }
    for (let padding = 0; padding < paddingCount; padding += 1) {
      output.push(renderFillerLine());
    }
    return output;
  }

  processNewSection(section, sectionIndex) {
    const output = [];
    const sectionLines = section.get('lines');
    const sectionMetaData = section.get('metaData');
    let currentIndex = 0;
    const startIndex = sectionMetaData.get('newDiffIndex');
    let paddingCount = 0;
    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex += 1) {
      const line = sectionLines.get(lineIndex);
      if (Utils.isOldLine(line)) {
        paddingCount += 1;
      } else if (Utils.isNewLine(line)) {
        if (!this.newLineTypes[sectionIndex]) {
          this.newLineTypes[sectionIndex] = [];
        }
        this.newLineTypes[sectionIndex].push(output.length);
        paddingCount -= 1;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      } else {
        for (let padding = 0; padding < paddingCount; padding += 1) {
          output.push(renderFillerLine());
        }
        paddingCount = 0;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      }
    }
    for (let padding = 0; padding < paddingCount; padding += 1) {
      output.push(renderFillerLine());
    }
    return output;
  }

  processUnifiedSection(section, sectionIndex) {
    const output = [];
    const sectionLines = section.get('lines');
    const sectionMetaData = section.get('metaData');
    let oldIndex = 0;
    const oldStartIndex = sectionMetaData.get('oldDiffIndex');
    const maxOldNumChars = Utils.getNumDigits(sectionMetaData.get('oldDiffMaxIndex'));

    let newIndex = 0;
    const newStartIndex = sectionMetaData.get('newDiffIndex');
    const maxNewNumChars = Utils.getNumDigits(sectionMetaData.get('newDiffMaxIndex'));

    const maxLineNumChars = maxOldNumChars + maxNewNumChars;

    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex += 1) {
      const line = sectionLines.get(lineIndex);
      if (Utils.isOldLine(line)) {
        oldIndex += 1;
        if (!this.oldLineTypes[sectionIndex]) {
          this.oldLineTypes[sectionIndex] = [];
        }
        this.oldLineTypes[sectionIndex].push(output.length);
        const currentNumDigits = Utils.getNumDigits(oldIndex + oldStartIndex);
        const whitespacePadding = ' '.repeat(maxLineNumChars - currentNumDigits);
        output.push(`${oldIndex + oldStartIndex} ${whitespacePadding} ${line}`);
      } else if (Utils.isNewLine(line)) {
        newIndex += 1;
        if (!this.newLineTypes[sectionIndex]) {
          this.newLineTypes[sectionIndex] = [];
        }
        this.newLineTypes[sectionIndex].push(output.length);
        const currentNewNumDigits = Utils.getNumDigits(newIndex + newStartIndex);
        const preWhitespacePadding = ' '.repeat(maxOldNumChars);
        const postWhitespacePadding = ' '.repeat(maxNewNumChars - currentNewNumDigits);
        output.push(`${preWhitespacePadding} ${newIndex + newStartIndex} ${postWhitespacePadding}${line}`);
      } else {
        newIndex += 1;
        oldIndex += 1;
        const currentOldNumDigits = Utils.getNumDigits(oldIndex + oldStartIndex);
        const currentNewNumDigits = Utils.getNumDigits(newIndex + newStartIndex);
        const oldWhiteSpacePadding = ' '.repeat(maxOldNumChars - currentOldNumDigits);
        const newWhiteSpacePadding = ' '.repeat(maxNewNumChars - currentNewNumDigits);
        output.push(`${oldIndex + oldStartIndex}${oldWhiteSpacePadding} ${newIndex + newStartIndex}${newWhiteSpacePadding} ${line}`);
      }
    }
    return output;
  }

  processSection(section, sectionIndex) {
    if (this.props.isUnifiedView) {
      return this.processUnifiedSection(section, sectionIndex);
    }
    if (this.props.isOld) {
      return this.processOldSection(section, sectionIndex);
    }
    return this.processNewSection(section, sectionIndex);
  }

  getMissingLineCount(section) {
    let missingLines = 0;
    const newLinesSize = section.get('new').size;
    const oldLinesSize = section.get('old').size;
    if (this.props.isOld) {
      if (oldLinesSize < newLinesSize) {
        missingLines = newLinesSize - oldLinesSize;
      }
    } else if (oldLinesSize > newLinesSize) {
      missingLines = oldLinesSize - newLinesSize;
    }
    return missingLines;
  }

  renderCode() {
    const sectionElements = [];
    for (let i = 0; i < this.props.lines.size; i += 1) {
      const section = this.props.lines.get(i);
      const sectionLines = this.processSection(section, i);
      sectionElements.push(
        <SyntaxHighlighter
          className={styles.section}
          wrapLines={true}
          lineStyle={(lineNum) => this.getLineStyle(lineNum, i)}
          style={syntaxStyle}
          key={i}
        >
          {sectionLines.join('\n')}
        </SyntaxHighlighter>
      );
    }
    return sectionElements;
  }

  render() {
    if (!this.props.lines) {
      return null;
    }

    const extraStyles = {
      width: this.props.isUnifiedView ? '100%' : '50%'
    };

    return (
      <div className={styles.container} style={extraStyles}>
        <div className={styles.code}>
          {this.renderCode()}
        </div>
      </div>
    );
  }
}

Code.propTypes = {
  lines: PropTypes.object,
  isUnifiedView: PropTypes.bool.isRequired,
  isOld: PropTypes.bool
};

function mapStateToProps(state) {
  const props = {};
  props.lines = state.files.getIn(['displayedFile', 'lines']);
  props.isUnifiedView = state.view.get('isUnified');
  return props;
}

export default connect(mapStateToProps, {
})(Code);
