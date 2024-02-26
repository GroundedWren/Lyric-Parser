/**
 * Namespace for index.html
 */
registerNamespace("LyricParser.Pages.Index", function (ns)
{
	ns.newDiscography = function newDiscography()
	{
		if (!LyricParser.Data)
		{
			fullReload();
		}
		else
		{
			confirmPopup(
				"New Discography",
				"Start a new discography? All unsaved changes will be lost",
				fullReload
			);
		}
	};

	ns.loadDiscography = function loadDiscography()
	{
		if (!LyricParser.Data)
		{
			loadDiscographyFromFile();
		}
		else
		{
			confirmPopup(
				"Load Discography",
				"Load a new discography? All unsaved changes will be lost",
				clearAndLoad
			);
		}
	};

	function fullReload()
	{
		window.onbeforeunload = () => { };
		window.location.href = window.location.href;
	}
	function clearAndLoad()
	{
		delete LyricParser.Data;
		Object.values(Common.Components.BoundElement.instanceMap).forEach(boundEl => boundEl.remove());
		Common.Components.BoundElement.instanceCount = 0;
		Common.Components.BoundElement.instanceMap = {};

		loadDiscographyFromFile();
	}

	function confirmPopup(titleMsg, message, onConfirm)
	{
		const doConfirm = () =>
		{
			Common.Controls.Popups.hideModal();
			onConfirm();
		};
		const doAbort = () =>
		{
			Common.Controls.Popups.hideModal();
		};

		Common.Components.registerShortcuts({
			"ALT+C": {
				action: doConfirm,
				description: "Confirm the dialog"
			},
			"ALT+G": {
				action: doAbort,
				description: "Abort the dialog"
			},
		});
		Common.Controls.Popups.showModal(
			`${titleMsg}`,
			`<p>${message}</p><br />`
			+ `<button id="confirmBtn" style="float: right; height: 25px; margin-left: 5px;">`
			+ `<u>C</u>ontinue</button>`
			+ `<button id="abortBtn" style="float: right; height: 25px;">`
			+ `<u>G</u>o back</button>`,
			undefined,
			() =>
			{
				Common.Components.unregisterShortcuts(["ALT+C", "ALT+G"]);
			}
		);
		document.getElementById("confirmBtn").onclick = doConfirm;
		document.getElementById("abortBtn").onclick = doAbort;
	}

	function loadDiscographyFromFile()
	{
		Common.FileLib.getFileFromUserAsObject(
			(object) =>
			{
				LyricParser.Data = object;
				renderData();
			},
			[{ 'application/json': ['.json'] }],
			".json"
		);
	}

	function renderData()
	{
		LyricParser.Data = LyricParser.Data || {};
		LyricParser.Data.Meta = LyricParser.Data.Meta || {};

		setSaveTime(new Date(LyricParser.Data.Meta["Last Save"]));

		const trackContainer = document.getElementById("trackContainer");
		Object.keys(LyricParser.Data.Tracks).forEach(trackDataId =>
		{
			trackContainer.insertAdjacentHTML("beforeend", `<gw-track dataId="${trackDataId}" startclosed="true"></gw-track>`);
		});

		//KJA TODO sort?
		const releaseContainer = document.getElementById("releaseContainer");
		Object.keys(LyricParser.Data.Releases).forEach(releaseDataId =>
		{
			releaseContainer.insertAdjacentHTML("beforeend", `<gw-release dataId="${releaseDataId}" startclosed="true"></gw-release>`);
		});
	}

	ns.saveDiscography = function saveDiscography()
	{
		Object.values(Common.Components.BoundElement.instanceMap).forEach(boundEl => boundEl.saveData());

		LyricParser.Data = LyricParser.Data || {};
		LyricParser.Data.Meta = LyricParser.Data.Meta || {};

		LyricParser.Data.Meta["Last Save"] = new Date();
		Common.FileLib.saveJSONFile(
			LyricParser.Data || {},
			LyricParser.Data?.Meta?.Title || "Discography",
			['.json']
		);

		setSaveTime(LyricParser.Data.Meta["Last Save"]);
	};
	function setSaveTime(saveDateTime)
	{
		const timeEl = document.getElementById("txtDate");

		timeEl.setAttribute("datetime", saveDateTime.toISOString());
		timeEl.innerText = saveDateTime.toLocaleString(
			undefined,
			{ dateStyle: "short", timeStyle: "short" }
		);
	};

	ns.addRelease = function addRelease()
	{
		const relEl = Common.DOMLib.crEl({
			tag: "gw-release",
			parent: document.getElementById("releaseContainer")
		});

		if (relEl.focusAnchor)
		{
			relEl.focusAnchor.focus();
		}
	};
	ns.addTrack = (name) =>
	{
		LyricParser.Data = LyricParser.Data || {};
		LyricParser.Data.Tracks = LyricParser.Data.Tracks || {};
		LyricParser.Data.Tracks[name] = { Name: name };

		const trackEl = Common.DOMLib.crEl({
			tag: "gw-track",
			parent: document.getElementById("trackContainer"),
			attrs: { dataId: name }
		});

		if (trackEl.focusAnchor)
		{
			trackEl.focusAnchor.focus();
		}

		return trackEl;
	};
	ns.onLinkTrack = (trackEl) =>
	{
		if (!trackEl) { return; }

		document.getElementById("trackContainer").prepend(trackEl);

		if (trackEl.focusAnchor)
		{
			trackEl.focusAnchor.focus();
		}
	};
});

/**
 * Code to be called when the window first loads
 */
window.onload = () =>
{
	Common.loadTheme();
	Common.setUpAccessibility();
	Common.Components.registerShortcuts({
		"ALT+1": {
			action: () => { document.getElementById("newButton").click(); },
			description: "New discography"
		},
		"ALT+2": {
			action: () => { document.getElementById("loadButton").click(); },
			description: "Load discography"
		},
		"ALT+3": {
			action: () => { document.getElementById("saveButton").click(); },
			description: "Save discography"
		},
		"ALT+S": {
			action: () => { document.getElementById("shortcutsButton").click(); },
			description: "Show shortcut keys"
		},
	});
};

window.onbeforeunload = (event) =>
{
	event.preventDefault();
	return false;
};