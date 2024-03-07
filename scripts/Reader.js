registerNamespace("LyricParser.Pages.Reader", function (ns)
{
	ns.urlParamMap = {
		"Iron & Wine": "./data/Iron_and_Wine.json"
	};
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

		renderOverview();
		renderReleases();
		renderTracks();

		window.history.replaceState(null, "", `?Discography=${encodeURIComponent(discObj.Meta.Artist)}`);
		LyricParser.Pages.Reader.mainPageCtrl.enableTabs();
		if (LyricParser.Pages.Reader.mainPageCtrl.activeTabId !== "mainPageCtrl_tab_Overview")
		{
			LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Overview", undefined, true);
		}
	};
	function renderOverview()
	{
		document.getElementById("imgProfile").src = LyricParser.Data.Meta.ArtistImage;
		document.getElementById("capProfile").innerText = `Image belongs to ${LyricParser.Data.Meta.Artist}`;

		document.getElementById("tdArtist").innerHTML = LyricParser.Data.Meta.Artist;
		document.getElementById("tdReleases").innerHTML = Object.keys(LyricParser.Data.Releases).length;
		document.getElementById("tdTracks").innerHTML = Object.keys(LyricParser.Data.Tracks).length;
		document.getElementById("tdUniqueWords").innerHTML = Object.keys(LyricParser.Data.WordIndex).length;

		const saveDateTime = new Date(LyricParser.Data.Meta["Last Save"]);
		const timeCreatedEl = document.getElementById("timeCreated");
		timeCreatedEl.setAttribute("datetime", saveDateTime.toISOString());
		timeCreatedEl.innerText = saveDateTime.toLocaleString(
			undefined,
			{ dateStyle: "short", timeStyle: "short" }
		);

		const topWordList = document.getElementById("overviewWordsList");
		const uncommonWordObjs = {};
		Object.keys(LyricParser.Data.TrackWords).forEach(trackName =>
		{
			const trackWordsObj = LyricParser.Data.TrackWords[trackName];
			Object.keys(trackWordsObj).forEach(word =>
			{
				const wordObj = trackWordsObj[word];
				if (!uncommonWordObjs[word])
				{
					uncommonWordObjs[word] = {ct: wordObj.ct, eg: wordObj.eg};
				}
				else
				{
					uncommonWordObjs[word].ct += wordObj.ct;
				}
			});
		});
		const sortedUncommonWordObjs = Object.values(uncommonWordObjs).sort((a, b) =>
		{
			return b.ct - a.ct;
		});
		for (let i = 0; i < Math.min(sortedUncommonWordObjs.length, 100); i++)
		{
			topWordList.insertAdjacentHTML(
				"beforeend",
				`<li>
					<a	href="javascript:void(0)"
						onclick="LyricParser.Pages.Reader.searchString('${sortedUncommonWordObjs[i].eg}')"
					>${sortedUncommonWordObjs[i].eg}<sup>${sortedUncommonWordObjs[i].ct}</sup>
					</a>
				</li>`
			);
		}
	}
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
		const releaseDispEl = Object.values(LyricParser.ReleaseDisplayEl.instanceMap).filter(
			releaseDispEl => releaseDispEl.title.replace(/'/g, "") === releaseTitle
		)[0];
		if (!releaseDispEl)
		{
			alert("Release not found");
			return;
		}

		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Releases", undefined, true);
		releaseDispEl.articleEl.scrollIntoView();
		Common.axAlertPolite("Release selected");
		releaseDispEl.titleEl.focus();
		setTimeout(() => { releaseDispEl.articleEl.focus(); }, 0);

	};

	ns.linkTrack = (trackTitle) =>
	{
		const trackDispEl = Object.values(LyricParser.TrackDisplayEl.instanceMap).filter(
			trackDispEl => trackDispEl.title.replace(/'/g, "") === trackTitle
		)[0];
		if (!trackDispEl)
		{
			alert("Track not found");
			return;
		}

		LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Tracks", undefined, true);
		trackDispEl.articleEl.scrollIntoView();
		trackDispEl.titleEl.focus();
		setTimeout(() => { trackDispEl.articleEl.focus(); }, 0);
	};

	ns.onSearchSubmit = (event) =>
	{
		event.preventDefault();
		ns.searchString(document.getElementById("txtSearch").value);
	};

	ns.SEARCH_GROUPING_WINDOW = 2;
	ns.searchString = (string) =>
	{
		const resultList = document.getElementById("searchResultList");
		resultList.innerHTML = "";
		document.getElementById("txtSearch").value = string;

		LyricParser.Pages.Reader.mainPageCtrl.enableTabs();
		if (LyricParser.Pages.Reader.mainPageCtrl.activeTabId !== "mainPageCtrl_tab_Search")
		{
			LyricParser.Pages.Reader.mainPageCtrl.setActiveTab("mainPageCtrl_tab_Search", undefined, true);
		}

		const searchWords = string.split(" ");
		const stmdSearchWrds = searchWords.map(
			word => stemmer(word.toLowerCase().replace(/\u003f|!|\u002e|,|\u0022/g, ""))
		).filter((val, idx, ary) => ary.indexOf(val) === idx);

		const resultMap = {};
		stmdSearchWrds.forEach(word =>
		{
			if (!LyricParser.Data.WordIndex[word]) { return; }
			LyricParser.Data.WordIndex[word].forEach(indexEntry =>
			{
				const entryKey = `${indexEntry.nm}-${indexEntry.sn}`;
				resultMap[entryKey] = resultMap[entryKey] || [];

				const nearbyResults = resultMap[entryKey].filter(resultObj =>
				{
					return (Math.abs(resultObj.min - indexEntry.ln) <= ns.SEARCH_GROUPING_WINDOW)
						|| (Math.abs(resultObj.max - indexEntry.ln) <= ns.SEARCH_GROUPING_WINDOW);
				});
				if (nearbyResults.length)
				{
					//There should only ever be one since anything in the window gets absorbed
					const nearbyResult = nearbyResults[0];
					nearbyResult.entries += " " + `${indexEntry.ln}-${indexEntry.wn}`;
					nearbyResult.min = Math.min(nearbyResult.min, indexEntry.ln);
					nearbyResult.max = Math.max(nearbyResult.max, indexEntry.ln);

					nearbyResult.foundWords[indexEntry.ln] = nearbyResult.foundWords[indexEntry.ln] || {};
					if (!nearbyResult.foundWords[indexEntry.ln].hasOwnProperty(word))
					{
						nearbyResult.foundWords[indexEntry.ln][word] = "";
						if (nearbyResult.lineCounts[indexEntry.ln])
						{
							nearbyResult.lineCounts[indexEntry.ln]++;
						}
						else
						{
							nearbyResult.lineCounts[indexEntry.ln] = 1;
						}
					}
				}
				else
				{
					const lineCounts = {};
					lineCounts[indexEntry.ln] = 1;

					const foundWords = {};
					foundWords[indexEntry.ln] = {};
					foundWords[indexEntry.ln][word] = "";

					resultMap[entryKey].push({
						min: indexEntry.ln,
						max: indexEntry.ln,
						entries: `${indexEntry.ln}-${indexEntry.wn}`,
						nm: indexEntry.nm,
						sn: indexEntry.sn,
						lineCounts: lineCounts,
						foundWords: foundWords,
					});
				}
			});
		});

		const results = Object.values(resultMap).reduce((acc, val) => { return acc.concat(val); }, []).sort(
			(a, b) =>
			{
				return (Math.max(...Object.values(b.lineCounts)) - Math.max(...Object.values(a.lineCounts)))
					|| (b.entries.length - a.entries.length);
			}
		);

		resultList.innerHTML = results.reduce(
			(acc, val) => acc + `<li><gw-result nm="${val.nm}" sn="${val.sn}" entries="${val.entries}"></gw-result></li>`,
			""
		);
		resultList.focus();
	};
});

window.onload = () =>
{
	Common.loadTheme();
	Common.setUpAccessibility();
	Common.Components.registerShortcuts({
		"ALT+O": {
			action: () => { document.getElementById("mainPageCtrl_tab_Overview").click(); },
			description: "Show overview"
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
			"mainPageCtrl_tab_Overview": document.getElementById("mainPageCtrl_page_Overview"),
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