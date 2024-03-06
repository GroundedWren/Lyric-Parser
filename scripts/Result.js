registerNamespace("LyricParser", function (ns)
{
	ns.ResultEl = class ResultEl extends HTMLElement
	{
		//#region staticProperties
		static instanceCount = 0;
		static instanceMap = {};
		//#endregion

		//#region instance properties
		instanceId;
		track;
		stanza;
		minLn;
		maxLn;
		entries;

		//#region element properties
		//#endregion
		//#endregion

		constructor()
		{
			super();
			this.instanceId = ResultEl.instanceCount++;
			ResultEl.instanceMap[this.instanceId] = this;
		}

		get idKey()
		{
			return `gw-result-${this.instanceId}`;
		}

		//#region HTMLElement implementation
		connectedCallback()
		{
			this.track = this.getAttribute("nm");
			this.stanza = this.getAttribute("sn");

			this.minLn = undefined;
			this.maxLn = undefined;
			this.entries = this.getAttribute("entries").split(" ").map(entryStr =>
			{
				const pieces = entryStr.split("-");
				const entry = { ln: parseInt(pieces[0]), wn: parseInt(pieces[1]) };
				if (this.minLn === undefined)
				{
					this.minLn = entry.ln;
				}
				if (this.maxLn === undefined)
				{
					this.maxLn = entry.ln
				}
				this.minLn = Math.min(this.minLn, entry.ln);
				this.maxLn = Math.max(this.maxLn, entry.ln);
				return entry;
			});

			const stanzaLines = ns.Data.Tracks[this.track].Stanzas[this.stanza];
			if (this.maxLn === this.minLn)
			{
				if (this.minLn > 0)
				{
					this.minLn--;
				}
				else if (this.maxLn < stanzaLines.length - 1)
				{
					this.maxLn++;
				}
			}

			this.lines = [];
			for (let i = this.minLn; i <= this.maxLn; i++)
			{
				this.lines.push(stanzaLines[i].slice());
			}
			this.entries.forEach(entry =>
			{
				this.lines[entry.ln - this.minLn][entry.wn] = `<mark>${this.lines[entry.ln - this.minLn][entry.wn]}</mark>`;
			});

			this.renderContent();
			this.registerHandlers();
		}
		//#endregion

		renderContent()
		{
			//Markup
			this.innerHTML = `
			<figure class="card">
				<blockquote>
					${this.lines.reduce((acc, val, idx) =>
					{
						return acc += `
						<div class="disp-line">
							<label for="${this.idKey}-${idx}">${idx + this.minLn}- </label>
							<span id="${this.idKey}-${idx}">${val.join(" ")}</span>
						</div>
						`;
					}, "")}
				</blockquote>
				<figcaption>
					Track: <a href="javascript:void(0)" onclick="LyricParser.Pages.Reader.linkTrack('${this.track}')">${this.track}</a>
					[Stanza ${this.stanza}]
				</figcaption>
			</figure>
			`;

			//element properties
		}

		//#region Handlers
		registerHandlers()
		{
		}
		//#endregion
	};
	customElements.define("gw-result", ns.ResultEl);
});