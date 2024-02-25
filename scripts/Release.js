registerNamespace("LyricParser", function (ns)
{
	ns.Release = class Release extends ns.BoundElement
	{
		hName;
		txtName;
		lastValidName;
		songList;
		btnAddSong;
		songIncrement;

		constructor()
		{
			super();

			this.lastValidName = "";
			this.songIncrement = 0;
		}

		get boundElementName()
		{
			return "Release";
		}

		get idKey()
		{
			return `gw-release-${this.instanceId}`
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
			//KJA TODO: add song list
			return {};
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
			<article class="card">
				<div class="card-header">
					<h3 id="${this.idKey}-hName">${this.data.Name}</h3>
				</div>
				<div class="input-horizontal-flex">
					<div class="input-vertical">
						<label for="${this.idKey}-txtName">Name</label>
						<input id="${this.idKey}-txtName"
							type="text"
							data-owner=${this.idKey}
							data-prop="Name"
						/>
					</div>
					<div class="input-vertical">
						<label for="${this.idKey}-numYear">Year</label>
						<input id="${this.idKey}-numYear"
							type="number"
							data-owner=${this.idKey}
							data-prop="Year"
						/>
					</div>
					<div class="input-vertical">
						<label for="${this.idKey}-selMonth">Month</label>
						<select id="${this.idKey}-selMonth"
							data-owner=${this.idKey}
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
						<label for="${this.idKey}-txtLink">Link</label>
						<input id="${this.idKey}-txtLink"
							type="text"
							data-owner=${this.idKey}
							data-prop="Link"
						/>
					</div>
				</div>
				<h4>Songs</h4>
				<ol id=${this.idKey}-songList></ol>
				<button id=${this.idKey}-btnAddSong>Add Song</button>
			</article>
			`;

			this.hName = document.getElementById(`${this.idKey}-hName`);
			this.txtName = document.getElementById(`${this.idKey}-txtName`);
			this.songList = document.getElementById(`${this.idKey}-songList`);
			this.btnAddSong = document.getElementById(`${this.idKey}-btnAddSong`);
		}
		registerHandlers()
		{
			this.txtName.addEventListener("change", () =>
			{
				if (this.txtName.value && this.tryMoveData(this.txtName.value))
				{
					this.lastValidName = this.txtName.value;
				}
				else if (this.txtName.value)
				{
					this.txtName.value = this.lastValidName;
					alert("Name conflict!");
				}

				this.hName.innerText = this.lastValidName || "New Release";
			});

			this.btnAddSong.addEventListener("click", () =>
			{
				this.songIncrement++;
				const songId = `${this.idKey}-${this.songIncrement}`
				this.songList.insertAdjacentHTML("beforeend", `
				<li id=${songId}-li>
					<div class="input-list-line">
						<label for=${songId}>Title: </label>
						<input id="${songId}" type="text"/>
						<button id=${songId}-del>Delete</button>
					</div>
				</li>
				`);
				document.getElementById(`${songId}-del`).addEventListener(
					"click",
					Common.fcd(this, function () { document.getElementById(`${songId}-li`).remove(); }, [songId])
				);
			});
		}
	};
	customElements.define("gw-release", ns.Release);
});