registerNamespace("LyricParser.Pages.Reader", function (ns)
{
	ns.urlParamMap = { "Iron & Wine": "./data/Iron_and_Wine.json" };
	ns.interperetUrlParams = (searchParams) =>
	{
		if (searchParams.has("Discography"))
		{
			const paramDisc = searchParams.get("Discography");
			if (ns.urlParamMap.hasOwnProperty(paramDisc))
			{
				document.getElementById("selDiscography").value = ns.urlParamMap[paramDisc];
				ns.changeDiscography();
			}
		}
	};

	ns.changeDiscography = () =>
	{
		const selection = document.getElementById("selDiscography").value;
		if (selection === "UPLOAD")
		{
			document.getElementById("discographyUpload").classList.remove("hidden");
			return;
		}
		else
		{
			document.getElementById("discographyUpload").classList.add("hidden");
		}
		Common.FileLib.loadJSONFileFromDirectory(selection).then(discObj =>
		{
			if (!discObj) { return; }
			ns.discographyUploaded(discObj);
		});
	};

	ns.onFileUpload = (changeEv) =>
	{
		Common.FileLib.parseJSONFile(
			changeEv.target.files[0],
			ns.discographyUploaded
		);
	};

	ns.discographyUploaded = (discObj) =>
	{
		document.getElementById("releaseList").innerHTML = "";
		document.getElementById("trackList").innerHTML = "";

		LyricParser.Data = discObj;

		renderReleases();
		renderTracks();

		window.history.replaceState(null, "", `?Discography=${encodeURIComponent(discObj.Meta.Artist)}`);
		LyricParser.Pages.Reader.mainPageCtrl.enableTabs();
		if (LyricParser.Pages.Reader.mainPageCtrl !== "mainPageCtrl_tab_Releases")
		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Releases", undefined, true);
	};
	function renderReleases()
	{
		const releaseList = document.getElementById("releaseList");
		LyricParser.Data.SortedReleaseList.forEach(releaseTitle =>
		{
			releaseList.insertAdjacentHTML(
				"beforeEnd",
				`<li><gw-release-display title="${releaseTitle}"></gw-release-display></li>`
			);
		});
	}
	function renderTracks()
	{
		const trackList = document.getElementById("trackList");
		const tracks = Object.keys(LyricParser.Data.Tracks).sort((a, b) =>
		{
			return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
		});
		tracks.forEach(trackTitle =>
		{
			trackList.insertAdjacentHTML(
				"beforeend",
				`<li><gw-track-display title="${trackTitle}"></gw-track-display></li>`
			);
		});
	}

	ns.linkRelease = (releaseTitle) =>
	{
		const articleEl = Object.values(LyricParser.ReleaseDisplayEl.instanceMap).filter(
			releaseDispEl => releaseDispEl.title === releaseTitle
		)[0].articleEl;
		if (!articleEl)
		{
			alert("Release not found");
			return
		}

		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Releases", undefined, true);
		articleEl.scrollIntoView();
		Common.axAlertPolite("Release selected");
		articleEl.focus({ focusVisible: true });
		
	};

	ns.linkTrack = (trackTitle) =>
	{
		const articleEl = Object.values(LyricParser.TrackDisplayEl.instanceMap).filter(
			trackDispEl => trackDispEl.title === trackTitle
		)[0].articleEl;
		if (!articleEl)
		{
			alert("Track not found");
			return;
		}

		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Tracks", undefined, true);
		articleEl.scrollIntoView();
		Common.axAlertPolite("Track selected");
		articleEl.focus({ focusVisible: true });
	};

	ns.searchString = (string) =>
	{
		alert(`Todo! Search "${string}"`);
	}
});

window.onload = () =>
{
	Common.loadTheme();
	Common.setUpAccessibility();
	Common.Components.registerShortcuts({
		"ALT+S": {
			action: () => { document.getElementById("shortcutsButton").click(); },
			description: "Show shortcut keys"
		},
		"ALT+R": {
			action: () => { document.getElementById("mainPageCtrl_tab_Releases").click(); },
			description: "Show releases"
		},
		"ALT+T": {
			action: () => { document.getElementById("mainPageCtrl_tab_Tracks").click(); },
			description: "Show tracks"
		},
		"ALT+A": {
			action: () => { document.getElementById("mainPageCtrl_tab_Search").click(); },
			description: "Show search"
		},
	});

	LyricParser.Pages.Reader.mainPageCtrl = new Common.Controls.PageControl.PageControl(
		document.getElementById("mainPageCtrl"),
		document.getElementById("mainPageCtrl_ts"),
		document.getElementById("mainPageCtrl_pgc"),
		{
			"mainPageCtrl_tab_Releases": document.getElementById("mainPageCtrl_page_Releases"),
			"mainPageCtrl_tab_Tracks": document.getElementById("mainPageCtrl_page_Tracks"),
			"mainPageCtrl_tab_Search": document.getElementById("mainPageCtrl_page_Search"),
		},
		"Select a discography to begin",
		"Reader",
		document.getElementById("mainPageCtrl_gutter")
	);
	LyricParser.Pages.Reader.mainPageCtrl.disableTabs();

	if (window.location.search)
	{
		LyricParser.Pages.Reader.interperetUrlParams(new URLSearchParams(window.location.search));
	}
};