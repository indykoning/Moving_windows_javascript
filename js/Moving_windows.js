//creating the path in every browser
if (!("path" in Event.prototype))
    Object.defineProperty(Event.prototype, "path", {
        get: function() {
            var path = [];
            var currentElem = this.target;
            while (currentElem) {
                path.push(currentElem);
                currentElem = currentElem.parentElement;
            }
            if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
                path.push(document);
            if (path.indexOf(window) === -1)
                path.push(window);
            return path;
        }
    });
Moving_windows = function (moveAbleWindow, MovingBar, settings) {
//setting some default settings
    var settings = settings||{};
    var functions = {};
        MovingBar.style.userSelect = 'none';
        moveAbleWindow.style.position = 'absolute';
        MovingBar.style.cursor = 'pointer';

//buttons
    //closeButton
    if (settings.closeButton){
        //create a div element and ready the html for the closebutton div
        var closeButton = document.createElement('div');
        settings.closeButtonHTML = settings.closeButtonHTML||'X';
        settings.closeButtonClass = settings.closeButtonClass||'moving_windows_close';
        //place the div in the top of the moving window and adding the html and classes
        MovingBar.appendChild(closeButton);
        closeButton.innerHTML = settings.closeButtonHTML;
        closeButton.classList.add(settings.closeButtonClass);
        //create an event dispatching when the close button is clicked
        var closeEvent = new Event('close');
        closeButton.onclick = function () {
            //dispatchign the close event and removing all of the eventlisteners
            moveAbleWindow.dispatchEvent(closeEvent);
            MovingBar.removeEventListener('touchstart', functions.touchstart);
            MovingBar.removeEventListener('touchend', functions.touchend);
            document.removeEventListener('touchmove', functions.touchmove);
            document.removeEventListener('mousemove', functions.mousemove);
            document.removeEventListener('keydown', functions.keydown);
            //emptying all variables and removing the window from the html
            MovingBar = null;
            moveAbleWindow.remove();
            moveAbleWindow = null;
            closeButton = null;
            functions = null;
        }
    }
//minimizeButton
    if (settings.minimizeButton){
        //create a div element and ready the html for the minimizebutton div
        var minimizeButton = document.createElement('div');
        settings.minimizeButtonHTML = settings.minimizeButtonHTML||'_';
        settings.minimizeButtonClass = settings.minimizeButtonClass||'moving_windows_minimize';
        //place the div in the top of the moving window and adding the html and classes
        MovingBar.appendChild(minimizeButton);
        minimizeButton.innerHTML = settings.minimizeButtonHTML;
        minimizeButton.classList.add(settings.minimizeButtonClass);
        //create an event dispatching when the minimize button is clicked
        var minimizeEvent = new Event('minimize');
        minimizeButton.onclick = function () {
            //dispatching the minimise event and adding a minimized class to be used in javascript outside of this script
            moveAbleWindow.dispatchEvent(minimizeEvent);
            moveAbleWindow.classList.add('minimized');
        }
    }
//simple open function removing the minimize class
    this.open = function() {
        moveAbleWindow.classList.remove("minimized");
    };
//buttons
    //if the mousebutton or touchscreen is pushed down
function pushedDown(e) {
    //setting the cursor to a moving icon
    MovingBar.style.cursor = "move";
    //saving the starting X and Y position
    MovingBar.startX = e.offsetX;
    MovingBar.startY = e.offsetY;
    //removing any transitions so it will folow the mouse smoothly
    MovingBar.style.transition = '';
    //setting the move to true
    MovingBar.move = true;
    //saving the original z-index and setting the new one whilst dragging
    moveAbleWindow.style.oldzIndex = moveAbleWindow.style.zIndex;
    moveAbleWindow.style.zIndex = '9999999';
}
//actually moving the window
function move(left, top){
    //check if the window should be blocked by the browsers edges and if it should check if it hasn't reached them yet, then setting the left and the top property to move the windows
        if (!settings.blockEdges || left>=0&&left+moveAbleWindow.clientWidth<=window.innerWidth) {
            moveAbleWindow.style.setProperty('left', left + 'px', 'important');
        }
        if (!settings.blockEdges || top>=0&&top+moveAbleWindow.clientHeight<=window.innerHeight+window.pageYOffset) {
            moveAbleWindow.style.setProperty('top', top + 'px', 'important');
        }
}
        // mouse
        //if the mousebutton is pushed down checking if it wasn't the close or minimise buttons being pushed down
        MovingBar.onmousedown = function (e) {
            e = e || event;
            if (e.path.indexOf(closeButton) == -1 && e.path.indexOf(minimizeButton)) {
                pushedDown(e);
            }
        };
        //setting everything back to normal when the mousebutton is released
        MovingBar.onmouseup = function () {
            this.move = false;
            this.style.cursor = "pointer";
            moveAbleWindow.style.zIndex = moveAbleWindow.style.oldzIndex||'auto';
        };
//moving the window when the mouse is moved
    functions.mousemove = function (e) {
        e = e || event;
        //checking if the mousebutton is being held down
        if (MovingBar.move) {
            move(e.pageX - MovingBar.startX, e.pageY - MovingBar.startY);
        }
    };
//release the window if escape is pressed
    functions.keydown = function (e) {
        e = e || event;
        if (e.keyCode == 27) {
            MovingBar.move = false;
        }
    };
    document.addEventListener('mousemove', functions.mousemove);
    document.addEventListener('keydown', functions.keydown);
    //end mouse


        //touchscreen
    functions.touchstart = function (e) {
        //setting the offsetX and offsetY which doesn't exist usually for touchscreens
        e = e || event;
        var rect = e.target.getBoundingClientRect();
        e.offsetX = e.targetTouches[0].pageX - rect.left;
        e.offsetY = e.targetTouches[0].pageY - rect.top;
        this.touchID = e.targetTouches[0].identifier;
        pushedDown(e);
    };
    functions.touchend = function (e) {
        //setting everything back to normal
        this.move = false;
        this.touchID = undefined;
        moveAbleWindow.style.zIndex = moveAbleWindow.style.oldzIndex||'auto';
    };

    //executing the touchstart and touchend functions
        MovingBar.addEventListener('touchstart', functions.touchstart);
        MovingBar.addEventListener('touchend', functions.touchend);
        //end touchscreen

    //touchscreen
    functions.touchmove = function (e) {
        e = e || event;
        if (MovingBar.move) {
            //running through registered touches on the device until it finds the one wanting to move the window and moving it
            for (var j = 0; j < e.targetTouches.length; j++) {
                if (MovingBar.touchID == e.targetTouches[j].identifier) {
                    move(e.targetTouches[e.targetTouches[j].identifier].pageX - MovingBar.startX, moveAbleWindow.style.top = e.targetTouches[e.targetTouches[j].identifier].pageY - MovingBar.startY);
                    break;
                }
            }
        }

    };
    document.addEventListener('touchmove', functions.touchmove);
    //end touchscreen


};