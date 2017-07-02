import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Code.css';
import ReactDOM from 'react-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { kimbieLight as syntaxStyle } from 'react-syntax-highlighter/dist/styles';
import Utils from '../utils/utils';

export class Code extends Component {

  getLineStyle(lineNum, sectionLines) {
    const oldLineStyle = {
      background: '#FFEEF0'
    };
    const newLineStyle = {
      background: '#E6FFED'
    };

    const lineSplit = sectionLines[lineNum-1].split(' ').filter(word => word.length > 0);
    if (lineSplit.length < 2) {
      return {};
    }

    console.log(lineSplit);

    if (lineSplit[1].startsWith('-')) {
      return oldLineStyle;
    }
    if (lineSplit[1].startsWith('+')) {
      return newLineStyle;
    }
    return {};
  }

  isOldLine(line) {
    return line.startsWith('-');
  }

  isNewLine(line) {
    return line.startsWith('+');
  }

  renderFillerLine() {
    return '';
  }

  processOldSection(section) {
    const output = [];
    const sectionLines = section.get('lines');
    const sectionMetaData = section.get('metaData');
    let currentIndex = 0;
    let paddingCount = 0;
    const startIndex = sectionMetaData.get('oldDiffIndex');
    let currentOtherIndex = 0;
    const startOtherIndex = sectionMetaData.get('newDiffIndex');
    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex++) {
      const line = sectionLines.get(lineIndex);
      if (this.isNewLine(line)) {
        paddingCount += 1;
        currentOtherIndex += 1;
      } else if (this.isOldLine(line)) {
        paddingCount -= 1;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      } else {
        for (let padding = 0; padding < paddingCount; padding++) {
          output.push(this.renderFillerLine());
        }
        paddingCount = 0;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
        currentOtherIndex += 1;
      }
    }
    for (let padding = 0; padding < paddingCount; padding++) {
      output.push(this.renderFillerLine());
    }
    return output;
  }

  processNewSection(section) {
    const output = [];
    const sectionLines = section.get('lines');
    const sectionMetaData = section.get('metaData');
    let currentIndex = 0;
    const startIndex = sectionMetaData.get('newDiffIndex');
    let currentOtherIndex = 0;
    let paddingCount = 0;
    const startOtherIndex = sectionMetaData.get('oldDiffIndex');
    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex++) {
      const line = sectionLines.get(lineIndex);
      if (this.isOldLine(line)) {
        paddingCount += 1;
        currentOtherIndex += 1;
      } else if (this.isNewLine(line)) {
        paddingCount -= 1;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
      } else {
        for (let padding = 0; padding < paddingCount; padding++) {
          output.push(this.renderFillerLine());
        }
        paddingCount = 0;
        output.push(`${currentIndex + startIndex} ${line}`);
        currentIndex += 1;
        currentOtherIndex += 1;
      }
    }
    for (let padding = 0; padding < paddingCount; padding++) {
      output.push(this.renderFillerLine());
    }
    return output;
  }

  processUnifiedSection(section) {
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

    for (let lineIndex = 0; lineIndex < sectionLines.size; lineIndex++) {
      const line = sectionLines.get(lineIndex);
      if (this.isOldLine(line)) {
        oldIndex += 1;
        const currentNumDigits = Utils.getNumDigits(oldIndex + oldStartIndex);
        const whitespacePadding = ' '.repeat(maxLineNumChars - currentNumDigits);
        output.push(`${oldIndex + oldStartIndex} ${whitespacePadding} ${line}`);
      } else if (this.isNewLine(line)) {
        newIndex += 1;
        const currentOldNumDigits = Utils.getNumDigits(oldIndex + oldStartIndex);
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

  processSection(section) {
    if (this.props.isUnifiedView) {
      return this.processUnifiedSection(section);
    }
    if (this.props.isOld) {
      return this.processOldSection(section);
    }
    return this.processNewSection(section);
  }

  getMissingLineCount(section) {
    let missingLines = 0;
    const newLinesSize = section.get('new').size;
    const oldLinesSize = section.get('old').size;
    if (this.props.isOld) {
      if (oldLinesSize < newLinesSize) {
        missingLines = newLinesSize - oldLinesSize;
      }
    } else {
      if (oldLinesSize > newLinesSize) {
        missingLines = oldLinesSize - newLinesSize;
      }
    }
    return missingLines;
  }

  renderCode() {
    const sectionElements = [];
    for (let i = 0; i < this.props.lines.size; i++) {
      const section = this.props.lines.get(i);
      const sectionLines = this.processSection(section);
      sectionElements.push(
        <SyntaxHighlighter
          className={styles.section}
          language='javascript'
          wrapLines={true}
          lineStyle={(lineNum) => this.getLineStyle(lineNum, sectionLines)}
          style={syntaxStyle}
          key={i}>
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

function mapStateToProps(state) {
  const displayedFile = state.files.get('displayedFile');
  const props = {};
  props.lines = state.files.getIn(['displayedFile', 'lines']);
  props.isUnifiedView = state.view.get('isUnified');
  return props;
}

export default connect(mapStateToProps, {
})(Code);
