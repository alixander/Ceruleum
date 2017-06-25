import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Navigator.css';
import { displayFile } from '../actions/navigator';

export class Navigator extends Component {
  componentDidMount() {
  }

  onFileClick(file) {
    this.props.displayFile(file);
  }

  renderFile({file, level, isDir}) {
    const padding = '-'.repeat(level);
    const extraStyles = {
      marginLeft: `${level * 1.5}rem`
    };
    let classes = styles['tree__item'];
    classes += (' ' + (isDir ? styles.directory : styles.file));
    return (
      <div
        key={file.name}
        onClick={isDir ? () => this.onDirClick(file) : () => this.onFileClick(file)}
        className={classes}
        style={extraStyles}>
        {file.name}
      </div>
    );
  }

  renderTree(files, level = 0) {
    const treeItems = [];
    for (const file of files) {
      if (file.children.length === 0) {
        treeItems.push(this.renderFile({file, level, isDir: false}));
      } else {
        treeItems.push(this.renderFile({file, level, isDir: true}));
        treeItems.push(this.renderTree(file.children, level + 1));
      }
    }
    return treeItems;
  }

  render() {
    if (!this.props.files) {
      return null;
    }

    return (
      <div className={styles.container}>
        <div>Files</div>
        <div className={styles.tree}>
          {this.renderTree(this.props.files)}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    files: state.files.get('allFiles')
  };
}

export default connect(mapStateToProps, {
  displayFile
})(Navigator);
