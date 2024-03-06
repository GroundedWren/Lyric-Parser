registerNamespace("LyricParser", function (ns)
{
	ns.Release = class Release extends Common.Components.CardBE
	{
		trackList;
		btnAddTrack;
		trackIncrement;

		constructor()
		{
			super();

			this.trackIncrement = 0;
		}

		get boundElementName()
		{
			return "Release";
		}

		get idKey()
		{
			return `gw-release-${this.instanceId}`;
		}

		get data()
		{
			ns.Data = ns.Data || {};
			ns.Data.Releases = ns.Data.Releases || {};
			return ns.Data.Releases[this.dataId];
		}
		set data(value)
		{
			ns.Data = ns.Data || {};
			ns.Data.Releases = ns.Data.Releases || {};
			ns.Data.Releases[this.dataId] = value;
		}
		get dataParent()
		{
			ns.Data = ns.Data || {};
			ns.Data.Releases = ns.Data.Releases || {};
			return ns.Data.Releases;
		}
		discardData()
		{
			delete ns.Data.Releases[this.dataId];
		}
		get dataPath()
		{
			throw `Data.Releases[${this.dataId}]`;
		}

		getSaveData()
		{
			const trackList = [];
			for (let trackLi of this.trackList.children)
			{
				trackList.push([...trackLi.getElementsByTagName("input")][0].value);
			}
			return {Tracks: trackList};
		}

		connectedCallback()
		{
			super.connectedCallback();
			if (this.initialized) { return; }

			this.data.Tracks = this.data.Tracks || [];
			for (let track of this.data.Tracks)
			{
				this.addTrack(track);
			}

			this.initialized = true;
		}
		renderContent()
		{
			this.innerHTML = `
			<article class="card" aria-labelledby="${this.idKey}-hName">
				${this.get_cardHeader("h3")}
				<div id="${this.idKey}-togEl">
					<div class="input-horizontal-flex card-line">
						<div class="input-vertical">
							<label for="${this.idKey}-txtName">Name</label>
							<input id="${this.idKey}-txtName"
								type="text"
								data-owner="${this.idKey}"
								data-prop="Name"
							/>
						</div>
						<div class="input-vertical">
							<label for="${this.idKey}-numYear">Year</label>
							<input id="${this.idKey}-numYear"
								type="number"
								data-owner="${this.idKey}"
								data-prop="Year"
							/>
						</div>
						<div class="input-vertical">
							<label for="${this.idKey}-selMonth">Month</label>
							<select id="${this.idKey}-selMonth"
								data-owner="${this.idKey}"
								data-prop="Month"
							>
								<option value="1">January</option>
								<option value="2">February</option>
								<option value="3">March</option>
								<option value="4">April</option>
								<option value="5">May</option>
								<option value="6">June</option>
								<option value="7">July</option>
								<option value="8">August</option>
								<option value="9">September</option>
								<option value="10">October</option>
								<option value="11">November</option>
								<option value="12">December</option>
							</select>
						</div>
						<div class="input-vertical">
							<label for="${this.idKey}-txtLink">Art Link</label>
							<input id="${this.idKey}-txtLink"
								type="text"
								data-owner="${this.idKey}"
								data-prop="Link"
							/>
						</div>
					</div>
					<div class="btn-header compact">
						<h4>Tracks</h4>
						<button id="${this.idKey}-btnAddTrack">Add Track</button>
					</div>
					<ol id="${this.idKey}-trackList"></ol>
				</div>
			</article>
			`;

			this.hName = document.getElementById(`${this.idKey}-hName`);
			this.txtName = document.getElementById(`${this.idKey}-txtName`);
			this.trackList = document.getElementById(`${this.idKey}-trackList`);
			this.btnAddTrack = document.getElementById(`${this.idKey}-btnAddTrack`);

			this.focusAnchor = this.txtName;
			this.togEl = document.getElementById(`${this.idKey}-togEl`);
		}
		registerHandlers()
		{
			super.registerHandlers();

			this.btnAddTrack.addEventListener("click", () =>
			{
				const trackId = this.addTrack();
				document.getElementById(`${trackId}`).focus();
			});
		}

		addTrack(name)
		{
			name = name || "";

			this.trackIncrement++;
			const trackId = `${this.idKey}-${this.trackIncrement}`;
			this.trackList.insertAdjacentHTML("beforeend", `
			<li id="${trackId}-li">
				<div class="input-list-line">
					<label for="${trackId}">Title: </label>
					<input id="${trackId}" type="text" value="${name}"/>
					<gw-be-link
						inputElId="${trackId}"
						networkedBEName="gw-track"
						createDelegate="LyricParser.Pages.Builder.addTrack"
						linkDelegate="LyricParser.Pages.Builder.onLinkTrack"
					></gw-be-link>
					<button id="${trackId}-del"><gw-icon iconKey="trash" title="delete"></gw-icon></button>
				</div>
			</li>
			`);
			document.getElementById(`${trackId}-del`).addEventListener(
				"click",
				Common.fcd(this, function () { document.getElementById(`${trackId}-li`).remove(); }, [trackId])
			);

			return trackId;
		}
	};
	customElements.define("gw-release", ns.Release);
});