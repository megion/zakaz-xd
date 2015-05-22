// объект пространства имен вспомогательных функций 
var myutils = {};

/**
 * Показать индикатор запроса к серверу
 */
myutils.loadingCount = 0;
myutils.showLoadingStatus = function(visible) {
	var statusDiv = document.getElementById('loadingStatus');
	if (statusDiv) {
		if (visible) {
			statusDiv.style.display = "inline";
			myutils.loadingCount++;
		} else {
			myutils.loadingCount--;
			setTimeout(function() {
				if (myutils.loadingCount==0) {
					statusDiv.style.display = "none";
				}
			}, 1000);
		}
		
	}
};

myutils.showError = function(container, errorMessage) {
	container.className = 'error';
	var msgElem = document.createElement('span');
	msgElem.className = "error-message";
	msgElem.innerHTML = errorMessage;
	container.appendChild(msgElem);
};

myutils.resetError = function(container) {
	container.className = '';
	if (container.lastChild.className == "error-message") {
		container.removeChild(container.lastChild);
	}
};
