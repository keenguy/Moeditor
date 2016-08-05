/*
 *  This file is part of Moeditor.
 *
 *  Copyright (c) 2016 Menci <huanghaorui301@gmail.com>
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

document.addEventListener('DOMContentLoaded', function() {
    const modeButton = document.getElementById('button-bottom-mode');
    const rightPanel = document.getElementById('right-panel');
    const leftPanel = document.getElementById('left-panel');
    const bottomLeftBackground = document.getElementById('cover-bottom-background-left');
    const bottomRightBackground = document.getElementById('cover-bottom-background-right');
    const modeMenu = document.getElementById('popup-menu-mode');
    const modeMenuItems = modeMenu.getElementsByTagName('li');
    const editor = document.getElementById('editor');

    function setMode(m) {
        function setWriteMode(f) {
            if (f) {
                rightPanel.style.right = '-50%';
                leftPanel.style.width = '100%';
                bottomRightBackground.style.right = '-50%';
                bottomLeftBackground.style.width = '100%';
                editor.classList.add('write-mode');
            } else {
                rightPanel.style.right = '';
                leftPanel.style.width = '';
                bottomRightBackground.style.right = '';
                bottomLeftBackground.style.width = '';
            }
        }

        editor.className = '';

        if (m === 'write-wide') {
            setWriteMode(true);
            editor.classList.add('write-mode-wide');
        } else if (m === 'write-medium') {
            setWriteMode(true);
            editor.classList.add('write-mode-medium');
        } else if (m === 'write-narrow') {
            setWriteMode(true);
            editor.classList.add('write-mode-thin');
        } else {
            setWriteMode(false);
            m = 'preview';
        }

        if (window.editMode === m) return;

        for (const it of modeMenuItems) it.getElementsByClassName('fa')[0].style.opacity = (it.attributes['data-name'].value === m) ? '1' : '0';

        window.editMode = m;
        moeApp.config.set('edit-mode', m);
    }

    setMode(moeApp.config.get('edit-mode'));

    modeButton.addEventListener('click', function() {
        window.toggleMenu(modeMenu);
    });

    for (const it of modeMenuItems) it.addEventListener('click', function() {
        setMode(it.attributes['data-name'].value);
        window.editor.focus();
    })

    editor.addEventListener('transitionend', function(e) {
        if (e.target === editor && e.propertyName === 'width') window.editor.refresh();
    });

    rightPanel.addEventListener('transitionend', function(e) {
        if (e.target === rightPanel && e.propertyName === 'right') window.updatePreview();
    });
});