registerNamespace("LyricParser.Pages.Reader", function (ns)
{
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
		LyricParser.Pages.Reader.mainPageCtrl.enableTabs();
		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Collections");
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
			"mainPageCtrl_tab_Collections": document.getElementById("mainPageCtrl_page_Collections"),
			"mainPageCtrl_tab_Tracks": document.getElementById("mainPageCtrl_page_Tracks"),
			"mainPageCtrl_tab_Search": document.getElementById("mainPageCtrl_page_Search"),
		},
		"Select a discography to begin",
		"Reader",
		document.getElementById("mainPageCtrl_gutter")
	);
	LyricParser.Pages.Reader.mainPageCtrl.disableTabs();
};