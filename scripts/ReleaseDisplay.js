registerNamespace("LyricParser", function (ns)
{
	ns.ReleaseDisplayEl = class ReleaseDisplayEl extends HTMLElement
	{
		//#region staticProperties
		static instanceCount = 0;
		static instanceMap = {};
		//#endregion

		//#region instance properties
		instanceId;
		data;
		datetime;

		//#region element properties
		articleEl;
		titleEl;
		//#endregion
		//#endregion

		constructor()
		{
			super();
			this.instanceId = ReleaseDisplayEl.instanceCount++;
			ReleaseDisplayEl.instanceMap[this.instanceId] = this;
		}

		get idKey()
		{
			return `gw-release-display-${this.instanceId}`;
		}

		//#region HTMLElement implementation
		connectedCallback()
		{
			this.title = this.getAttribute("title");
			this.data = ns.Data.Releases[this.title];
			this.datetime = new Date(parseInt(this.data.Year), parseInt(this.data.Month) - 1);

			this.renderContent();
			this.registerHandlers();
		}
		//#endregion

		renderContent()
		{
			//Markup
			this.innerHTML = `
			<article	id="${this.idKey}-article"
						class="card"
						aria-labelledby="${this.idKey}-hTitle"
						tabindex="-1"
			>
				<div class="card-header">
					<h3 id="${this.idKey}-hTitle" tabIndex="-1">${this.title}</h3>
					<time class="header-time" datetime="${this.datetime.toISOString()}">
						${this.datetime.toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) }
					</time>
				</div>
				<div class="release-content">
					<figure>
						<img src="${this.data.Link}" alt="Artwork for ${this.title}">
						<figcaption>Image belongs to ${ns.Data.Meta.Artist}</figcaption>
					</figure>
					<div>
						<h4 id="${this.idKey}-hTrackList">Track List</h4>
						<ol id="${this.idKey}-trackList" aria-labelledby="${this.idKey}-hTrackList" class="spacy-list">
						</ol>
					</div>
					<div>
						<h4 id="${this.idKey}-hTopWordList">Top Uncommon Words</h4>
						<ol id="${this.idKey}-topWordList" aria-labelledby="${this.idKey}-hTopWordList" class="spacy-list">
						</ol>
					</div>
				</div>
			</article>
			`;

			const trackList = document.getElementById(`${this.idKey}-trackList`);
			this.data.Tracks.forEach(trackName =>
			{
				trackList.insertAdjacentHTML(
					"beforeend",
					`<li>
						<a	href="javascript:void(0)"
							onclick="LyricParser.Pages.Reader.linkTrack('${trackName.replace(/'/g, "") }')"
						>${trackName}</a>
					</li>`
				);
			});

			const topWordList = document.getElementById(`${this.idKey}-topWordList`);
			const collectionWordObjs = {};
			this.data.Tracks.forEach(trackName =>
			{
				const trackWordsObj = ns.Data.TrackWords[trackName];
				if (!trackWordsObj) { return; }

				Object.keys(trackWordsObj).forEach(word =>
				{
					const wordObj = trackWordsObj[word];
					if (!collectionWordObjs[word])
					{
						collectionWordObjs[word] = {ct: wordObj.ct, eg: wordObj.eg};
					}
					else
					{
						collectionWordObjs[word].ct += wordObj.ct;
					}
				});
			});
			const sortedCollectionWordObjs = Object.values(collectionWordObjs).sort((a, b) =>
			{
				return b.ct - a.ct;
			});
			for (let i = 0; i < Math.min(sortedCollectionWordObjs.length, 15); i++)
			{
				topWordList.insertAdjacentHTML(
					"beforeend",
					`<li>
						<a	href="javascript:void(0)"
							onclick="LyricParser.Pages.Reader.searchString('${sortedCollectionWordObjs[i].eg}')"
						>${sortedCollectionWordObjs[i].eg}<sup>${sortedCollectionWordObjs[i].ct}</sup>
						</a>
					</li>`
				);
			}

			//element properties
			this.articleEl = document.getElementById(`${this.idKey}-article`);
			this.titleEl = document.getElementById(`${this.idKey}-hTitle`);
		}

		//#region Handlers
		registerHandlers()
		{
		}
		//#endregion
	};
	customElements.define("gw-release-display", ns.ReleaseDisplayEl);
});