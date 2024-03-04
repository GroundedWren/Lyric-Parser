registerNamespace("LyricParser.Pages.Reader", function (ns)
{
	ns.urlParamMap = { "Iron & Wine": "./data/Iron_and_Wine.json"};
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
		LyricParser.Data = discObj;
		const releaseList = document.getElementById("releaseList");
		const releases = Object.keys(LyricParser.Data.Releases).sort((a, b) =>
		{
			const relA = LyricParser.Data.Releases[a];
			const relB = LyricParser.Data.Releases[b]
			return parseInt(relA.Year + relA.Month) - parseInt(relB.Year + relB.Month);
		});
		releases.forEach(releaseTitle =>
		{
			releaseList.insertAdjacentHTML(
				"beforeEnd",
				`<li><gw-release-display title="${releaseTitle}"></gw-release-display></li>`
			);
		});

		window.history.replaceState(null, "", `?Discography=${encodeURIComponent(discObj.Meta.Artist)}`)
		LyricParser.Pages.Reader.mainPageCtrl.enableTabs();
		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Releases");
	};
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