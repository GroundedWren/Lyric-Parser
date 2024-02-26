registerNamespace("LyricParser", function (ns)
{
	ns.Track = class Track extends ns.CardBE
	{
		constructor()
		{
			super();

			this.lastValidName = "";
		}

		get boundElementName()
		{
			return "Track";
		}

		get idKey()
		{
			return `gw-track-${this.instanceId}`;
		}

		get data()
		{
			ns.Data = ns.Data || {};
			ns.Data.Tracks = ns.Data.Tracks || {};
			return ns.Data.Tracks[this.dataId];
		}
		set data(value)
		{
			ns.Data = ns.Data || {};
			ns.Data.Tracks = ns.Data.Tracks || {};
			ns.Data.Tracks[this.dataId] = value;
		}
		get dataParent()
		{
			ns.Data = ns.Data || {};
			ns.Data.Tracks = ns.Data.Tracks || {};
			return ns.Data.Tracks;
		}
		discardData()
		{
			delete ns.Data.Tracks[this.dataId];
		}
		get dataPath()
		{
			throw `Data.Tracks[${this.dataId}]`;
		}

		connectedCallback()
		{
			super.connectedCallback();
			if (this.initialized) { return; }

			this.initialized = true;
		}
		renderContent()
		{
			this.innerHTML = `
			<article class="card" aria-labelledby="${this.idKey}-hName">
				${this.get_cardHeader("h3")}
				<div id=${this.idKey}-togEl>
					<div class="input-horizontal-flex card-line">
						<div class="input-vertical">
							<label for="${this.idKey}-txtName">Name</label>
							<input id="${this.idKey}-txtName"
								type="text"
								data-owner=${this.idKey}
								data-prop="Name"
							/>
						</div>
					</div>
				</div>
			</article>
			`;

			this.hName = document.getElementById(`${this.idKey}-hName`);
			this.txtName = document.getElementById(`${this.idKey}-txtName`);

			this.focusAnchor = this.txtName;
			this.togEl = document.getElementById(`${this.idKey}-togEl`);
		}
		registerHandlers()
		{
			super.registerHandlers();
		}
	};
	customElements.define("gw-track", ns.Track);
});