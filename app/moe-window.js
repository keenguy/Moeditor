/*
 *  This file is part of Moeditor.
 *
 *  Copyright (c) 2016 Menci <huanghaorui301@gmail.com>
 *  Copyright (c) 2016 lucaschimweg
 *
 *  Moeditor is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Moeditor is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Moeditor. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const BrowserWindow = require('electron').BrowserWindow,
      dialog = require('electron').dialog,
      MoeditorAction = require('./moe-action'),
      MoeditorFile = require('./moe-file'),
      Path = require('path');

class MoeditorWindow {
	constructor(path,fileName) {
        moeApp.newWindow = this;
        this.directory = path
        this.fileName = fileName;
        if (MoeditorFile.isFile(fileName)) {
            this.fileContent = this.content = MoeditorFile.read(fileName).toString();
        }else{
            this.fileContent = this.content = '';
        }
        this.changed = false;
        const debug = (moeApp.flag.debug | moeApp.config.get('debug')) != 0;
        var conf = {
            icon: Const.path + "/icons/Moeditor.ico",
            autoHideMenuBar: true,
            width: 1000 * moeApp.config.get('scale-factor'),
            height: 600 * moeApp.config.get('scale-factor'),
            webPreferences: {
                zoomFactor: moeApp.config.get('scale-factor')
            },
			show: debug
        };

        if (process.platform == 'darwin') conf.titleBarStyle = 'hidden-inset';
        else conf.frame = false;

		this.window = new BrowserWindow(conf);
        this.window.moeditorWindow = this;

        this.registerEvents();
        this.window.loadURL('file://' + Const.path + '/views/main/index.html');
        if (debug) {
            this.window.webContents.openDevTools();
        }
	}
    /* open file or folder from current window */
    open(path, fileName){
        if(MoeditorFile.isDirectory(path)){
            if(path == this.directory) return;
            this.directory = path;
            if(MoeditorFile.isFile(fileName) && this.fileName != fileName){
                this.closeFile(this.fileName);
                this.fileName = fileName;
                this.fileContent = this.content = MoeditorFile.read(path).toString();
                this.changed = false;
            }
            this.window.loadURL('file://' + Const.path + '/views/main/index.html');
            moeApp.config.set('cwd', path);
            if (this.fileName.indexOf(path) == 0){
                moeApp.config.set('cwf', fileName);
            }
        }else if(MoeditorFile.isFile(path)){
            this.closeFile(this.fileName);
            this.fileName = path;
            this.fileContent = this.content = MoeditorFile.read(path).toString();
            this.window.webContents.send("openFile", this.content);
            if (path.indexOf(this.directory) == 0){
                moeApp.config.set('cwf', path);
            }
        }else{
            this.closeFile(this.fileName);
            this.fileName = '';
            this.fileContent = this.content = '';
            this.window.webContents.send("openFile", this.content);
        }     
    }
    closeFile(fileName){
        if (this.changed) {
                const choice = dialog.showMessageBox(
                    this.window,
                    {
                        type: 'question',
                        buttons: [__("Yes"), __("No"), __("Cancel")],
                        title: __("Confirm"),
                        message: __("Save changes to file?")
                    }
                );

                if (choice == 0) {
                    if (!MoeditorAction.save(this.window)) e.preventDefault();
                } else if (choice == 2) e.preventDefault();
            }
    }
    registerEvents() {
        this.window.on('close', (e) => {
            if (this.changed) {
                const choice = dialog.showMessageBox(
                    this.window,
                    {
                        type: 'question',
                        buttons: [__("Yes"), __("No"), __("Cancel")],
                        title: __("Confirm"),
                        message: __("Save changes to file?")
                    }
                );

                if (choice == 0) {
                    if (!MoeditorAction.save(this.window)) e.preventDefault();
                } else if (choice == 2) e.preventDefault();
            }

            const index = moeApp.windows.indexOf(this);
            if (index !== -1) moeApp.windows.splice(index, 1);
        });
    }
}

module.exports = MoeditorWindow;
