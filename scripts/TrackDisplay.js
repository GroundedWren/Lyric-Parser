registerNamespace("LyricParser", function (ns)
{
	ns.TrackDisplayEl = class TrackDisplayEl extends HTMLElement
	{
		//#region staticProperties
		static instanceCount = 0;
		static instanceMap = {};
		static LINK_THRESHOLD = 3;
		//#endregion

		//#region instance properties
		instanceId;
		title;
		data;
		trackWords;
		linksByIndex;

		//#region element properties
		articleEl;
		titleEl;
		//#endregion
		//#endregion

		constructor()
		{
			super();
			this.instanceId = TrackDisplayEl.instanceCount++;
			TrackDisplayEl.instanceMap[this.instanceId] = this;
		}

		get idKey()
		{
			return `gw-track-display-${this.instanceId}`;
		}

		//#region HTMLElement implementation
		connectedCallback()
		{
			this.title = this.getAttribute("title");
			this.data = ns.Data.Tracks[this.title];
			this.trackWords = ns.Data.TrackWords[this.title];

			this.data.Stanzas = this.data.Stanzas || [];

			this.#buildLinksByIndex();

			this.renderContent();
			this.registerHandlers();
		}
		//#endregion

		#buildLinksByIndex()
		{
			this.linksByIndex = {};
			const linkedWords = {}
			for (let sNum = 0; sNum < this.data.Stanzas.length; sNum++)
			{
				const lineAry = this.data.Stanzas[sNum];
				for (let lNum = 0; lNum < lineAry.length; lNum++)
				{
					const wordAry = lineAry[lNum];
					for (let wNum = 0; wNum < wordAry.length; wNum++)
					{
						const word = wordAry[wNum];
						let stemmedWord = word.toLowerCase().replace(
							/\u003f|!|\u002e|,|\u0022/g,
							""
						).replace(/\u2019|\u2018/g, "'");
						stemmedWord = stemmer(stemmedWord).toLowerCase();

						if (linkedWords.hasOwnProperty(stemmedWord)
							|| !this.trackWords.hasOwnProperty(stemmedWord)
						) { continue; }
						linkedWords[stemmedWord] = "";

						const numRefs = ns.Data.WordIndex[stemmedWord].length;
						if (numRefs <= TrackDisplayEl.LINK_THRESHOLD) { continue; }

						this.linksByIndex[this.#getWordKey(sNum, lNum, wNum)] = `
							<a	href="javascript:void(0)"
								onclick="LyricParser.Pages.Reader.searchString('${word}')"
							>${word} <sup>${numRefs}</sup></a>
						`;
					}
				}
			}
		}

		#getWordKey(sNum, lNum, wNum)
		{
			return `${sNum}-${lNum}-${wNum}`;
		}

		renderContent()
		{
			//Markup
			this.innerHTML = `
			<article	id="${this.idKey}-article"
						class="card"
						aria-labelledby="${this.idKey}-hTitle"
						tabIndex="-1"
			>
				<div class="card-header">
					<h3 id="${this.idKey}-hTitle" tabIndex="-1">${this.title}</h3>
				</div>
				<div class="track-content">
					<h4 id="${this.idKey}-hAppears">Appears on</h4>
					<ol aria-labelledby="${this.idKey}-hAppears">
						${this.data.OrderedReleases.reduce((acc, releaseTitle) =>
						{
							return acc + `
							<li>
								<a	href="javascript:void(0)"
									onclick="LyricParser.Pages.Reader.linkRelease('${releaseTitle.replace(/'/g, "") }')"
								>${releaseTitle}</a>
							</li>
							`
						}, "")}
					</ol>
					<h4>Lyrics</h4>
					${this.data.Stanzas.reduce((sAcc, lineAry, stanzaIdx) =>
					{
						return sAcc + `
						<h5>[Stanza ${stanzaIdx}]</h5>
						<div>${lineAry.reduce((lAcc, wordAry, lineIdx) =>
						{
							return lAcc + `
								<div class="disp-line">
									<label for="${this.idKey}-line-${lineIdx}">${lineIdx}-</label> <span id="${this.idKey}-line-${lineIdx}">
										${wordAry.map((word, wordIdx) =>
										{
											const wordKey = this.#getWordKey(stanzaIdx, lineIdx, wordIdx);
											return this.linksByIndex.hasOwnProperty(wordKey)
												? this.linksByIndex[wordKey]
												: word;
										}).join(" ")}
									</span>
								</div>
							`;
						}, "") }</div>
						`;
					}, "")}
				</div>
			</article>
			`;

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
	customElements.define("gw-track-display", ns.TrackDisplayEl);
});