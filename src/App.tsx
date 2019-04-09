import React, { Component, CSSProperties } from 'react';
import './App.css';

import cloud from './cloud.png';

//@ts-ignore
const { ipcRenderer } = window;

export interface IAppProps {
};

class App extends Component<any, any> {
  private _locationTextBox:any;

  constructor(p: IAppProps, s: any) {
    super(p, s);

    this.state = {
      promptText: 'Drop a file here',
      status: undefined,
      error: undefined,
      location: undefined,
      isDraggedOver: false,
    };

    ipcRenderer.on('status', (_: any, data: any) => {
      console.log('data', data);

      if (data && data.location) {
        this._makeNotification('File Uploaded', data.location);

        this.setState({
          status: 'success',
          location: data.location,
          promptText: 'Drop another file!',
        });
      } else if (data && data.error) {
        this.setState({
          status: 'error',
          promptText: 'Drop a different file!',
          error: data.error,
        });
      }
    });
  }
  
  private _makeNotification = (title: string, body: string): void => {
    // @ts-ignore
    const notification = new window.Notification(title,
      {
        body,
        silent: false,
      });

    notification.onclick = ():void => {
      ipcRenderer.send('focusWindow', 'mainWindow');
    };
  }

  private _handleLinkClicked = (): void => {
    this._makeNotification('Hello', 'I am an electron notification!');
  }
  
  private _handleDragOver = (e: any): void => {
    e.preventDefault();
    this.setState({
      promptText: 'Drop the file!',
      isDraggedOver: true,
    });
  }

  private _handleDragExit = (): void => {
    this.setState({
      promptText: 'Drag a file here.',
      isDraggedOver: false,
    });
  }

  private _handleDrop = (e: any): void => {
    e.preventDefault();
    
    if (e.dataTransfer && e.dataTransfer.files) {
      console.log('e', e.dataTransfer.files[0].path);

      this.setState({
        promptText: 'Dropped!',
        location: undefined,
        status: undefined,
        isDraggedOver: false,
      });

      ipcRenderer.send('file-drop', e.dataTransfer.files[0].path);
    }
  }

  public render() {
    const { isDraggedOver } = this.state;

    const calculatedStyle: CSSProperties = {
      display: 'flex',
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center',
      width: '80%',
      height: '80%',
      // border: '1px solid #000',
      backgroundColor: isDraggedOver ? 'rgba(20, 20, 20, 0.25)' : '#fff',
    };

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <h1 className="title">Hot Dang Personal Cloud Uploader</h1>
        </header>

        <div className="window-content">
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(250, 250, 250, 0.2)',
            }}
          >
            <div className="droppable" style={calculatedStyle}
              onDragOver={this._handleDragOver}
              onDragLeave={this._handleDragExit}
              onDragEnd={this._handleDrop}
              onDrop={this._handleDrop}
            />
            <p>{this.state.promptText}</p>

            {
              this.state.status && this.state.location
              ? (
                <div style={{ width: '100%' }}>
                  <input
                    type="text"
                    style={{ width: '100%', textAlign: 'center', borderTop: 0, borderLeft: 0, borderRight: 0 }}
                    ref={(el) => this._locationTextBox = el}
                    value={this.state.location}
                    onClick={() => {
                      this._locationTextBox.select();
                      document.execCommand('copy');
                    }}
                  ></input>
                </div>
              )
              : null
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
