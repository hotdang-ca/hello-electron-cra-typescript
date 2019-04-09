import React, { Component } from 'react';

//@ts-ignore
import logo from './logo.svg';

import './App.css';

//@ts-ignore
const { ipcRenderer } = window;

export interface IAppProps {
};

class App extends Component<any, any> {
  constructor(p: IAppProps, s: any) {
    super(p, s);

    this.state = {
      promptText: 'Drop a file here',
      status: undefined,
      error: undefined,
      location: undefined,
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
    });
  }

  private _handleDragExit = (): void => {
    this.setState({
      promptText: 'Drag a file here.',
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
      });

      ipcRenderer.send('file-drop', e.dataTransfer.files[0].path);
    }
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header" style={{ height: '100%' }}>
        <div
          style={{ width: '80%', height: '80%', border: '1px solid #fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(250, 250, 250, 0.2' }}
          onDragOver={this._handleDragOver}
          onDragLeave={this._handleDragExit}
          onDragEnd={this._handleDrop}
          onDrop={this._handleDrop}
        >
          <p>{this.state.promptText}</p>
        </div>

        {
          this.state.status && this.state.location
          ? (<div
            style={{ width: '80%', height: '80%', border: '1px solid #fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(250, 250, 250, 0.1' }}
          >
            {this.state.status}<br/>
            {this.state.location}
          </div>)
          : null
        }

        </header>

      </div>
    );
  }
}

export default App;
