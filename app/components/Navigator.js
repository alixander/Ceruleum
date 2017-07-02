import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FileIcon from 'react-icons/lib/go/file-text';
import FolderIcon from 'react-icons/lib/ti/folder-open';
import ClosedFolderIcon from 'react-icons/lib/ti/folder';
import HomeIcon from 'react-icons/lib/go/home';

import styles from './Navigator.css';
import {
  displayFile,
  toggleFolderDisplay,
  setRootDirectory
} from '../actions/navigator';

export class Navigator extends Component {

  onFileClick(file) {
    if (file.path !== this.props.displayedFile.get('path')) {
      this.props.displayFile(file);
    }
  }

  onDirClick(file) {
    this.props.toggleFolderDisplay(file);
  }

  renderFile({ file, level, isFolded, isDir }) {
    const extraStyles = {
      marginLeft: `${level * 1.5}rem`
    };
    let classes = styles.tree__item;
    classes += ` ${isDir ? styles.directory : styles.file}`;
    if (this.props.displayedFile && this.props.displayedFile.get('path') === file.path) {
      classes += ` ${styles['tree__item--displayed']}`;
    }
    let icon = <FileIcon className={styles.icon} />;
    if (isDir) {
      if (isFolded) {
        icon = <ClosedFolderIcon className={styles.icon} />;
      } else {
        icon = <FolderIcon className={styles.icon} />;
      }
    }
    return (
      <div
        key={file.name}
        role='button'
        onClick={isDir ? () => this.onDirClick(file) : () => this.onFileClick(file)}
        className={classes}
        style={extraStyles}
      >
        {icon}
        {file.name}
      </div>
    );
  }

  renderTree(files, level = 0) {
    const treeItems = [];
    for (const file of files) {
      if (file.children.length === 0) {
        treeItems.push(this.renderFile({ file, level, isDir: false }));
      } else {
        const isFolded = this.props.foldedDirectories.includes(file);
        treeItems.push(this.renderFile({ file, level, isFolded, isDir: true }));
        if (!isFolded) {
          treeItems.push(this.renderTree(file.children, level + 1));
        }
      }
    }
    return treeItems;
  }

  render() {
    if (!this.props.files) {
      return null;
    }

    const extraContainerStyles = {
      width: this.props.width
    };

    return (
      <div className={styles.container} style={extraContainerStyles}>
        <div className={styles.header}>Files</div>
        <div className={styles.rootSelector}>
          <button className={styles.button} onClick={this.props.setRootDirectory}>
            <HomeIcon className={styles.homeIcon} />
            <span className={styles.buttonText}> Set Home Directory</span>
          </button>
        </div>
        <div className={styles.tree}>
          {this.renderTree(this.props.files)}
        </div>
      </div>
    );
  }
}

Navigator.propTypes = {
  displayedFile: PropTypes.object,
  foldedDirectories: PropTypes.object,
  files: PropTypes.object,
  width: PropTypes.number,
  displayFile: PropTypes.func.isRequired,
  setRootDirectory: PropTypes.func.isRequired,
  toggleFolderDisplay: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files.get('allFiles'),
    displayedFile: state.files.get('displayedFile'),
    foldedDirectories: state.files.get('folded')
  };
}

export default connect(mapStateToProps, {
  displayFile,
  toggleFolderDisplay,
  setRootDirectory
})(Navigator);
