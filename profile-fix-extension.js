// ==UserScript==
// @name         Generals.io Fixed Profile (bigteam)
// @namespace    http://tampermonkey.net/
// @version      1.1.4
// @description  Fixes the profile
// @author       pasghetti, edits by EklipZ
// @match        https://generals.io/profiles/*
// @match        https://*.generals.io/profiles/*
// @grant        none
// ==/UserScript==

var newTable = document.createElement("table");
var pageControl = document.createElement("div");
var curMode = "all";
var curPlayer = "";
var tabChangeDetection = new MutationObserver(function(mutationList, observer) {
	for(var mutation of mutationList) {
		if(mutation.type === "attributes") {
			var replayTabs = document.getElementById("tabs-replay-filter");
			for(var child of replayTabs.children) {
				if(child.classList.contains("selected")) {
					switch(child.textContent) {
						case "All":
						curMode = "all";
						break;
						case "FFA":
						curMode = "classic";
						break;
						case "1v1":
						curMode = "1v1";
						break;
						case "2v2":
						curMode = "2v2";
						break;
						case "BigTeam":
						curMode = "bigteam";
						break;
						case "Custom":
						curMode = "custom";
						break;
					}
					updateStats();
					changePage(1);
					break;
				}
			}
		}
	}
});
var hideReplaysDetection = new MutationObserver(function(mutationList, observer) {
	for(var mutation of mutationList) {
		if(mutation.type === "attributes") {
			var profileTabs = document.getElementById("tabs-profile");
			for(var child of profileTabs.children) {
				if(child.classList.contains("inverted")) {
					switch(child.textContent) {
						case "Replays":
						newTable.style.display = "";
						pageControl.style.display = "";
						break;
						case "Custom Maps":
						newTable.style.display = "none";
						pageControl.style.display = "none";
						break;
					}
				}
			}
		}
	}
});
var replayLoadDetection = new MutationObserver(function(mutationList, observer) {
	var oldTable = document.getElementById("replays-table");
	if(oldTable) {
		var tableParent = oldTable.parentElement;
		if(oldTable.style.display != "none") {
			var replayTabs = document.getElementById("tabs-replay-filter");
			tabChangeDetection.observe(replayTabs, { childList: true, attributes: true, subtree: true });
			var profileTabs = document.getElementById("tabs-profile");
			hideReplaysDetection.observe(profileTabs, { childList: true, attributes: true, subtree: true });
			tableParent.appendChild(pageControl);
			tableParent.appendChild(newTable);
			oldTable.style.display = "none"; // prankd
		}
		if(tableParent.children.length >= 2 && oldTable.parentElement.children[1].textContent == "Load More") {
			tableParent.children[1].style.display = "none";
		}
	}
});
replayLoadDetection.observe(document.body, { childList: true, attributes: false, subtree: true });

function getReplays(user, offset, count) {
	var xmlhttp = new XMLHttpRequest();
	return new Promise((resolve, reject) => {
		xmlhttp.open("GET", "//"+window.location.hostname+"/api/replaysForUsername?u="+encodeURIComponent(username)+"&offset=" + offset + "&count=" + count, true);
		xmlhttp.onreadystatechange = function() {
			if(this.readyState != 4) return;
			if (this.status == 200) {
				resolve(JSON.parse(this.responseText));
			} else {
				reject();
			}
		};
		xmlhttp.send();
	});
}

var username = document.getElementsByClassName("profile-header")[0].firstElementChild.firstChild.lastChild.textContent;
var searchLists = {"all": {}, "1v1": {}, "classic": {}, "2v2": {}, "custom": {}, "bigteam": {}};
var generalLists = {"all": [], "1v1": [], "classic": [], "2v2": [], "custom": [], "bigteam": []};
var replays = [];

async function initReplays() {
	var replayCountPromises = [];
	for(var i = 0; i <= 17; ++i) {
		replayCountPromises.push(getReplays(username, (1 << i) - 1, 50));
	}
	var replayBound = 1;
	await Promise.all(replayCountPromises).then((values) => {
		for(var rep of values) {
			if(rep.length == 0) {
				break;
			}
			replayBound *= 2
		}
	});
	await getReplays(username, 0, 200).then((value) => {
		replays = value;
		var idx = 0;
		for(replay of replays) {
			for(player of replay["ranking"]) {
				if(player["currentName"] != username) {
					if(searchLists[replay["type"]][player["currentName"]] === undefined) {
						searchLists[replay["type"]][player["currentName"]] = [];
					}
					searchLists[replay["type"]][player["currentName"]].push(idx);
					if(searchLists["all"][player["currentName"]] === undefined) {
						searchLists["all"][player["currentName"]] = [];
					}
					searchLists["all"][player["currentName"]].push(idx);
				}
			}
			generalLists[replay["type"]].push(idx);
			generalLists["all"].push(idx);
			++idx;
		}
		updateStats();
		changePage(1);
	});
	var replayPromises = [];
	for(var i = 1; i < Math.min(300, Math.ceil(replayBound / 200)); ++i) {
		replayPromises.push(getReplays(username, i * 200, 200));
	}
	Promise.all(replayPromises).then((values) => {
		nReplays = [].concat.apply([], values);
		var idx = replays.length;
		replays = replays.concat(nReplays);
		for(replay of nReplays) {
			for(player of replay["ranking"]) {
				if(player["currentName"] != username) {
					if(searchLists[replay["type"]][player["currentName"]] === undefined) {
						searchLists[replay["type"]][player["currentName"]] = [];
					}
					searchLists[replay["type"]][player["currentName"]].push(idx);
					if(searchLists["all"][player["currentName"]] === undefined) {
						searchLists["all"][player["currentName"]] = [];
					}
					searchLists["all"][player["currentName"]].push(idx);
				}
			}
			generalLists[replay["type"]].push(idx);
			generalLists["all"].push(idx);
			++idx;
		}
		updateStats();
		changePage(oldPage);
	});
}

initReplays();

var startTime = 0;
var endTime = Infinity;
var minLength = 0;
var maxLength = Infinity;
var starMin = 0;
var starMax = Infinity;
var showWin = true;
var showLoss = true;
var onlyCustomVs = false;
newTable.classList.add("list");
newTable.classList.add("selectable");
var tableHead = document.createElement("thead");
var headRow = document.createElement("tr");
var headCol1 = document.createElement("th");
headCol1.setAttribute("style", "width: 12em;");
headCol1.textContent = "Time";
var headCol2 = document.createElement("th");
headCol2.textContent = "Turns";
var headCol3 = document.createElement("th");
headCol3.textContent = "Result";
headRow.appendChild(headCol1);
headRow.appendChild(headCol2);
headRow.appendChild(headCol3);
tableHead.appendChild(headRow);
newTable.appendChild(tableHead);
var tableBody = document.createElement("tbody");
newTable.appendChild(tableBody);
var curPageList;

function updateTable(pageList) {
	curPageList = pageList;
	while(tableBody.firstChild) {
		tableBody.removeChild(tableBody.firstChild);
	}
	for(var idx of pageList) {
		var nRow = document.createElement("tr");
		nRow.onclick = (e) => {
			var cellTarget = e.target;
			while(cellTarget.parentElement && cellTarget.parentElement.tagName.toLowerCase() !== "tr") {
				cellTarget = cellTarget.parentElement;
			}
			if(!cellTarget.parentElement) {
				return;
			}
			var i = 0;
			while(i < tableBody.children.length && tableBody.children[i] !== cellTarget.parentElement) {
				++i;
			}
			window.open("//"+window.location.hostname+"/replays/"+replays[curPageList[i]]["id"], "_blank");
		};
		var nDate = document.createElement("td");
		nDate.textContent = (new Date(replays[idx]["started"])).toLocaleString();
		var nTurns = document.createElement("td");
		nTurns.textContent = Math.ceil(replays[idx]["turns"] / 2);
		var nResult = document.createElement("td");
		nResult.classList.add("replay-col-result");
		nResult.setAttribute("style", "font-size: 14px;");
		for(player of replays[idx]["ranking"]) {
			var playerSpan = document.createElement("span");
			var nameSpan = document.createElement("span");
			var nameLink = document.createElement("a");
			nameLink.setAttribute("href", "/profiles/" + encodeURIComponent(player["currentName"]));
			nameLink.setAttribute("target", "_blank");
			nameLink.setAttribute("style", "color: inherit;");
			nameLink.textContent = player["name"];
			nameLink.addEventListener("click", function(e) {
				e.stopPropagation();
			});
			nameSpan.appendChild(nameLink);
			var starSpan = document.createElement("span");
			starSpan.setAttribute("dir", "ltr");
			var lParen = document.createTextNode(" (");
			var numSpan = document.createElement("span");
			numSpan.setAttribute("style", "white-space: nowrap;");
			var starSymbolSpan = document.createElement("span");
			starSymbolSpan.setAttribute("style", "color: gold;");
			starSymbolSpan.textContent = "★ ";
			var starCount = document.createTextNode(((player["stars"] === undefined || player["stars"] === null) ? "lazer bad" : player["stars"].toString()));
			numSpan.appendChild(starSymbolSpan);
			numSpan.appendChild(starCount);
			var rParen = document.createTextNode(")");
			starSpan.appendChild(lParen);
			starSpan.appendChild(numSpan);
			starSpan.appendChild(rParen);
			playerSpan.appendChild(nameSpan);
			playerSpan.appendChild(starSpan);
			nResult.appendChild(playerSpan);
			nResult.appendChild(document.createElement("br"));
		}
		nRow.appendChild(nDate);
		nRow.appendChild(nTurns);
		nRow.appendChild(nResult);
		tableBody.appendChild(nRow);
	}
}

function lowerBoundDate(list, date) {
	var low = 0;
	var high = list.length;
	while(low != high) {
		var mid = Math.floor((low + high) / 2);
		if(replays[list[mid]]["started"] > date) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
	return low;
}

function getCurrentList() {
	var curList;
	if(curPlayer === "") {
		curList = generalLists[curMode];
	} else {
		curList = searchLists[curMode][curPlayer];
	}
	if(curList === undefined) {
		curList = [];
	}
	if(startTime == 0 && endTime == Infinity && minLength == 0 && maxLength == Infinity && starMin == 0 && starMax == Infinity && showWin && showLoss && !onlyCustomVs) {
		return curList;
	}
	curList = curList.filter((x) => replays[x]["turns"] / 2 >= minLength && replays[x]["turns"] / 2 <= maxLength);
	if(starMin > 0 || starMax != Infinity) {
		curList = curList.filter((x) => {
			if(replays[x]["ranking"].length != 2) {
				return true;
			}
			for(var i = 0; i < 2; i++) {
				if(replays[x]["ranking"][i]["currentName"] != username &&
			 	replays[x]["ranking"][i]["stars"] !== undefined &&
			 	replays[x]["ranking"][i]["stars"] !== null &&
			 	replays[x]["ranking"][i]["stars"] > starMin && replays[x]["ranking"][i]["stars"] < starMax) {
					return true;
				}
			}
			return false;
		});
	}
	curList = curList.filter((x) => replays[x]["ranking"][0]["currentName"] == username && showWin || replays[x]["ranking"][0]["currentName"] != username && showLoss);
	if(onlyCustomVs) {
		curList = curList.filter((x) => replays[x]["type"] != "custom" || replays[x]["ranking"].length == 2);
	}
	return curList.slice(lowerBoundDate(curList, endTime), lowerBoundDate(curList, startTime));
}
async function updateStats() {
	var curList = getCurrentList();
	var timeStat = curList.reduce((x, y) => {
		var playerRank = 0;
		var gameSize = replays[y]["ranking"].length;
		for(; playerRank < gameSize; playerRank++) {
			var player = replays[y]["ranking"][playerRank];
			if(player["currentName"] == username) {
				break;
			}
		}
		if(playerRank == gameSize || playerRank == 0) {
			return x + replays[y]["turns"];
		}
		return x + replays[y]["turns"] * (1 - 1.0 * (playerRank - 1) / (gameSize - 1));
	}, 0);
	timeStat = Math.floor(timeStat / 2);
	var played = curList.length;
	if(curMode == "all") {
		var v1Wins = 0;
		var v1Played = 0;
		var ffaWins = 0;
		var ffaPlayed = 0;
        // 2v2 and bigteam win counters are broken because being player 0 isn't required for your team to have won.
        var bigteamPlayed = 0;
        var bigteamWins = 0;
		var v2Wins = 0;
		var v2Played = 0;
		var customWins = 0;
		var customPlayed = 0;
		for(var rep of curList) {
			switch(replays[rep]["type"]) {
				case "classic":
				ffaPlayed++;
				if(replays[rep]["ranking"][0]["currentName"] === username) {
					ffaWins++;
				}
				break;
				case "1v1":
				v1Played++;
				if(replays[rep]["ranking"][0]["currentName"] === username) {
					v1Wins++;
				}
				break;
				case "2v2":
				v2Played++;
				if(replays[rep]["ranking"][0]["currentName"] === username) {
					v2Wins += 2;
				}
				break;
				case "custom":
				customPlayed++;
				if(replays[rep]["ranking"][0]["currentName"] === username) {
					customWins++;
				}
				break;
				case "bigteam":
				bigteamPlayed++;
				if(replays[rep]["ranking"][0]["currentName"] === username) {
					bigteamWins++;
				}
				break;
			}
		}
		statSpan.innerHTML = "<span class=\"bold\">Time played:</span> " +
		Math.floor(timeStat / 3600) + "h " +
		Math.floor((timeStat % 3600) / 60) + "m " +
		Math.floor(timeStat % 60) + "s | <span class=\"bold\">Games played:</span> " +
		played;
		statSpan2.innerHTML = "<span class=\"bold\">1v1:</span> " + v1Played + " | " + v1Wins + " | " + Math.floor(v1Wins / v1Played * 10000) / 100 + "% - <span class=\"bold\">FFA:</span> " +
		ffaPlayed + " | " + ffaWins + " | " + Math.floor(ffaWins / ffaPlayed * 10000) / 100 + "% - <span class=\"bold\">2v2:</span> " +
		v2Played + " | " + v2Wins + " | " + Math.floor(v2Wins / v2Played * 10000) / 100 + "% - <span class=\"bold\">BigTeam:</span> " +
		bigteamPlayed + " | " + bigteamWins + " | " + Math.floor(bigteamWins / bigteamPlayed * 10000) / 100 + "% - <span class=\"bold\">Custom:</span> " +
		customPlayed + " | " + customWins + " | " + Math.floor(customWins / customPlayed * 10000) / 100 + "%";
	} else {
		var wins = 0;
		var top3 = 0;
        var placeSum = 0;
		var forfeits = 0;
		for(var rep of curList) {
			if(replays[rep]["ranking"][0]["currentName"] === username) {
				wins++;
				if(curMode == "2v2") {
					wins++;
				}
			}
			if(curMode == "classic" &&
				(replays[rep]["ranking"][0]["currentName"] === username ||
					replays[rep]["ranking"].length > 1 && replays[rep]["ranking"][1]["currentName"] === username ||
					replays[rep]["ranking"].length > 2 && replays[rep]["ranking"][2]["currentName"] === username)) {
				top3++;
			}
			if(replays[rep]["ranking"].length == 2 && replays[rep]["ranking"][0]["currentName"] !== username && replays[rep]["turns"] < 50) {
				forfeits++;
			}
            for (let i = 0; i < replays[rep]["ranking"].length; i++) {
                if (replays[rep]["ranking"][i]["currentName"] === username) {
					placeSum += i;
				}
            }
		}
		statSpan.innerHTML = "<span class=\"bold\">Time played:</span> " +
		Math.floor(timeStat / 3600) + "h " +
		Math.floor((timeStat % 3600) / 60) + "m " +
		Math.floor(timeStat % 60) + "s | <span class=\"bold\">Games played:</span> " +
		played;
		statSpan2.innerHTML = "<span class=\"bold\">Wins:</span> " +
		Math.round(wins / played * 10000) / 100 + "% \\ " + wins;
		if(curMode == "classic") {
			statSpan2.innerHTML += " | <span class=\"bold\">Top 3s:</span> " + (top3 / played * 100).toFixed(2) + "% \\ " + top3;
			statSpan2.innerHTML += " | <span class=\"bold\">Avg Place:</span> " + (1 + placeSum / played).toFixed(2);
		}
		if(curMode == "1v1" || curMode == "custom" && onlyCustomVs) {
			statSpan2.innerHTML += " | <span class=\"bold\">Forfeits:</span> " + Math.round(forfeits / played * 10000) / 100 + "% \\ " + forfeits;
		}
	}
}
var pageCount = document.createElement("input");
var oldPage = 1;
var pageSize = 20;
function changePage(page) {
	if(page < 1) return false;
	var curList = getCurrentList();
	if(curList.length == 0) {
		pageList = [];
		updateTable(pageList);
		return false;
	}
	if(page > Math.ceil(curList.length / pageSize)) {
		return false;
	}
	var pageList = [];
	for(var idx = (page - 1) * pageSize; idx < page * pageSize && idx < curList.length; idx++) {
		pageList.push(curList[idx]);
	}
	updateTable(pageList);
	oldPage = page;
	pageCount.value = oldPage;
	return true;
}

var allLeft = document.createElement("button");
allLeft.textContent = "<<";
allLeft.classList.add("small");
allLeft.addEventListener("click", () => {
	changePage(1);
	pageCount.value = oldPage;
});
var left = document.createElement("button");
left.textContent = "<";
left.classList.add("small");
left.addEventListener("click", () => {
	changePage(oldPage - 1);
	pageCount.value = oldPage;
});
pageCount.setAttribute("type", "text");
pageCount.setAttribute("style", "text-align: center; width: 5em;");
pageCount.value = 1;
pageCount.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		if(!isNaN(pageCount.value)) {
			var pageNum = (new Number(pageCount.value)).valueOf();
			if(Number.isInteger(pageNum) && changePage(pageNum)) {
				return;
			}
		}
		pageCount.value = oldPage;
	}
});
var right = document.createElement("button");
right.textContent = ">";
right.classList.add("small");
right.addEventListener("click", () => {
	changePage(oldPage + 1);
	pageCount.value = oldPage;
});
var allRight = document.createElement("button");
allRight.textContent = ">>";
allRight.classList.add("small");
allRight.addEventListener("click", () => {
	var curList = getCurrentList();
	changePage(Math.ceil(curList.length / pageSize));
	pageCount.value = oldPage;
});
function updateSettings() {
	curPlayer = userForm.value;
	if(fromInput.value === undefined || fromInput.value === "") {
		startTime = 0;
	} else {
		startTime = new Date(fromInput.value).getTime();
	}

	if(toInput.value === undefined || toInput.value === "") {
		endTime = Infinity;
	} else {
		endTime = new Date(toInput.value).getTime() + 86400000; // add one day so they see the games on the day of the end time
	}

	if(minLengthInput.value == "") {
		minLength = 0;
	} else if(!isNaN(minLengthInput.value)) {
		var inputNum = (new Number(minLengthInput.value)).valueOf();
		if(Number.isInteger(inputNum)) {
			minLength = inputNum;
		}
	}

	if(maxLengthInput.value == "") {
		maxLength = Infinity;
	} else if(!isNaN(maxLengthInput.value)) {
		var inputNum = (new Number(maxLengthInput.value)).valueOf();
		if(Number.isInteger(inputNum)) {
			maxLength = inputNum;
		}
	}

	if(starMinInput.value == "") {
		starMin = 0;
	} else if(!isNaN(starMinInput.value)) {
		var inputNum = (new Number(starMinInput.value)).valueOf();
		if(Number.isInteger(inputNum)) {
			starMin = inputNum;
		}
	}

	if(starMaxInput.value == "") {
		starMax = Infinity;
	} else if(!isNaN(starMinInput.value)) {
		var inputNum = (new Number(starMaxInput.value)).valueOf();
		if(Number.isInteger(inputNum)) {
			starMax = inputNum;
		}
	}

	showWin = (showWinInput.checked);

	showLoss = (showLossInput.checked);

	onlyCustomVs = (customVsInput.checked);

	if(!isNaN(pageSizeInput.value)) {
		var numInput = (new Number(pageSizeInput.value)).valueOf();
		if(Number.isInteger(numInput)) {
			pageSize = numInput;
		}
	}
	pageSizeInput.value = pageSize;

	updateStats();
	changePage(1);
}
function exportURL() {
	var res = window.location.protocol + '//' + window.location.host + window.location.pathname;
	var params = "";
	if(curPlayer !== "") {
		params += "&opp=" + encodeURIComponent(curPlayer);
	}
	if(startTime !== 0) {
		params += "&st=" + startTime;
	}
	if(endTime !== Infinity) {
		params += "&et=" + endTime;
	}
	if(minLength !== 0) {
		params += "&minl=" + minLength;
	}
	if(maxLength !== Infinity) {
		params += "&maxl=" + maxLength;
	}
	if(starMin !== 0) {
		params += "&mins=" + starMin;
	}
	if(starMax !== Infinity) {
		params += "&maxs=" + starMax;
	}
	if(!showWin) {
		params += "&wins=false";
	}
	if(!showLoss) {
		params += "&loss=false";
	}
	if(onlyCustomVs) {
		params += "&vs=true";
	}
	if(params.length > 0) {
		params = "?" + params.substr(1);
	}
	return res + params;
}
var includesUserTag = document.createElement("span");
includesUserTag.textContent = "Includes user: ";
includesUserTag.setAttribute("style", "color: white;");
var userForm = document.createElement("input");
userForm.setAttribute("type", "text");
userForm.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var fromTimeTag = document.createElement("span");
fromTimeTag.textContent = " | From ";
fromTimeTag.setAttribute("style", "color: white;");
var fromInput = document.createElement("input");
fromInput.setAttribute("type", "date");
fromInput.addEventListener("change", () => {
	updateSettings();
});
var toTimeTag = document.createElement("span");
toTimeTag.textContent = " to ";
toTimeTag.setAttribute("style", "color: white;");
var toInput = document.createElement("input");
toInput.setAttribute("type", "date");
toInput.addEventListener("change", () => {
	updateSettings();
});
var minLengthTag = document.createElement("span");
minLengthTag.textContent = "Min. length: ";
minLengthTag.setAttribute("style", "color: white;");
var minLengthInput = document.createElement("input");
minLengthInput.setAttribute("type", "text");
minLengthInput.setAttribute("style", "width: 5em;");
minLengthInput.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var maxLengthTag = document.createElement("span");
maxLengthTag.textContent = ", Max. length: ";
maxLengthTag.setAttribute("style", "color: white;");
var maxLengthInput = document.createElement("input");
maxLengthInput.setAttribute("type", "text");
maxLengthInput.setAttribute("style", "width: 5em;");
maxLengthInput.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var starMinTag = document.createElement("span");
starMinTag.textContent = " | Star min: ";
starMinTag.setAttribute("style", "color: white;");
var starMinInput = document.createElement("input");
starMinInput.setAttribute("type", "text");
starMinInput.setAttribute("style", "width: 5em;");
starMinInput.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var starMaxTag = document.createElement("span");
starMaxTag.textContent = " | Star max: ";
starMaxTag.setAttribute("style", "color: white;");
var starMaxInput = document.createElement("input");
starMaxInput.setAttribute("type", "text");
starMaxInput.setAttribute("style", "width: 5em;");
starMaxInput.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var showWinTag = document.createElement("span");
showWinTag.textContent = "Show wins ";
showWinTag.setAttribute("style", "color: white;");
var showWinInput = document.createElement("input");
showWinInput.setAttribute("type", "checkbox");
showWinInput.checked = true;
showWinInput.addEventListener("click", function() {
	updateSettings();
}, false);
var showLossTag = document.createElement("span");
showLossTag.textContent = " | Show losses ";
showLossTag.setAttribute("style", "color: white;");
var showLossInput = document.createElement("input");
showLossInput.setAttribute("type", "checkbox");
showLossInput.checked = true;
showLossInput.addEventListener("click", function() {
	updateSettings();
}, false);
var customVsTag = document.createElement("span");
customVsTag.textContent = " | Only count VS games for custom: ";
customVsTag.setAttribute("style", "color: white;");
var customVsInput = document.createElement("input");
customVsInput.setAttribute("type", "checkbox");
customVsInput.addEventListener("click", function() {
	updateSettings();
}, false);
var saveSettingsButton = document.createElement("button");
saveSettingsButton.classList.add("small");
saveSettingsButton.textContent = "Save Settings As Link";
var saveSettingsField = document.createElement("textarea");
saveSettingsField.style.position = "fixed";
saveSettingsField.style.top = 0;
saveSettingsField.style.left = 0;
saveSettingsField.style.width = "2em";
saveSettingsField.style.height = "2em";
saveSettingsField.style.padding = 0;
saveSettingsField.style.border = "none";
saveSettingsField.style.outline = "none";
saveSettingsField.style.boxShadow = "none";
saveSettingsField.style.background = "transparent";
saveSettingsButton.addEventListener("click", function() {
	document.body.appendChild(saveSettingsField);
	saveSettingsField.value = exportURL();
	saveSettingsField.focus();
	saveSettingsField.select();
	document.execCommand("copy");
	document.body.removeChild(saveSettingsField);
});
var pageSizeTag = document.createElement("span");
pageSizeTag.textContent = "Page size: ";
pageSizeTag.setAttribute("style", "color: white;");
var pageSizeInput = document.createElement("input");
pageSizeInput.setAttribute("type", "text");
pageSizeInput.setAttribute("style", "text-align: center; width: 5em;");
pageSizeInput.value = 20;
pageSizeInput.addEventListener("keyup", (event) => {
	event.preventDefault();
	if(event.keyCode === 13) {
		updateSettings();
	}
});
var statSpan = document.createElement("span");
statSpan.setAttribute("style", "color: white;");
var statSpan2 = document.createElement("span");
statSpan2.setAttribute("style", "color: white;");

pageControl.appendChild(includesUserTag);
pageControl.appendChild(userForm);
pageControl.appendChild(fromTimeTag);
pageControl.appendChild(fromInput);
pageControl.appendChild(toTimeTag);
pageControl.appendChild(toInput);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(minLengthTag);
pageControl.appendChild(minLengthInput);
pageControl.appendChild(maxLengthTag);
pageControl.appendChild(maxLengthInput);
pageControl.appendChild(starMinTag);
pageControl.appendChild(starMinInput);
pageControl.appendChild(starMaxTag);
pageControl.appendChild(starMaxInput);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(showWinTag);
pageControl.appendChild(showWinInput);
pageControl.appendChild(showLossTag);
pageControl.appendChild(showLossInput);
pageControl.appendChild(customVsTag);
pageControl.appendChild(customVsInput);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(statSpan);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(statSpan2);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(saveSettingsButton);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(pageSizeTag);
pageControl.appendChild(pageSizeInput);
pageControl.appendChild(document.createElement("br"));
pageControl.appendChild(allLeft);
pageControl.appendChild(left);
pageControl.appendChild(pageCount);
pageControl.appendChild(right);
pageControl.appendChild(allRight);
pageControl.setAttribute("style", "padding-bottom: 10px; position: relative; top: initial;");

var params = new URLSearchParams(location.search);
if(params.get("opp") !== undefined && params.get("opp") !== null) {
	curPlayer = params.get("opp");
	userForm.value = curPlayer;
}
if(params.get("st") !== undefined && params.get("st") !== null && Number.isInteger(+params.get("st"))) {
	startTime = +params.get("st");
	fromInput.value = new Date(startTime).toISOString().split("T")[0];
}
if(params.get("et") !== undefined && params.get("et") !== null && Number.isInteger(+params.get("et"))) {
	endTime = +params.get("et");
	toInput.value = new Date(endTime - 86400000).toISOString().split("T")[0];
}
if(params.get("minl") !== undefined && params.get("minl") !== null && Number.isInteger(+params.get("minl"))) {
	minLength = +params.get("minl");
	minLengthInput.value = minLength;
}
if(params.get("maxl") !== undefined && params.get("maxl") !== null && Number.isInteger(+params.get("maxl"))) {
	maxLength = +params.get("maxl");
	maxLengthInput.value = maxLength;
}
if(params.get("mins") !== undefined && params.get("mins") !== null && Number.isInteger(+params.get("mins"))) {
	starMin = +params.get("mins");
	starMinInput.value = starMin;
}
if(params.get("maxs") !== undefined && params.get("maxs") !== null && Number.isInteger(+params.get("maxs"))) {
	starMax = +params.get("maxs");
	starMaxInput.value = starMax;
}
if(params.get("wins") === "false") {
	showWin = false;
	showWinInput.checked = false;
}
if(params.get("loss") === "false") {
	showLoss = false;
	showLossInput.checked = false;
}
if(params.get("vs") === "true") {
	onlyCustomVs = true;
	customVsInput.checked = true;
}

var init = -1;
window.onscroll = function() {
	if(newTable.style.display == "none") {
		init = -1;
		return;
	}
	if(init == -1) {
		init = pageControl.getBoundingClientRect().top + window.pageYOffset;
	}
	if(window.pageYOffset > init) {
		newTable.setAttribute("style", "position: relative; top: " + pageControl.clientHeight + "px;");
		pageControl.setAttribute("style", "padding-bottom: 10px; background-color: #333; position: fixed; top: 0px; left: 0%; width: 100%; z-index: 1;");
	} else {
		pageControl.setAttribute("style", "padding-bottom: 10px; position: relative; top: initial;");
		newTable.setAttribute("style", "");
	}
};
