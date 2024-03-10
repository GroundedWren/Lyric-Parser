registerNamespace("LyricParser", function (ns)
{
	ns.preStemWord = (word) =>
	{
		let preStemmedWord = word.toLowerCase().replace(
			/\u003f|!|\u002e|,|\u0022|\u0028|\u0029|'s/g,
			""
		).replace(
			/\u2019|\u2018/g,
			"'"
		);

		if (preStemmedWord.endsWith("n'"))
		{
			preStemmedWord = preStemmedWord.replace(
				/n'/g,
				"ng"
			);
		}

		return preStemmedWord
	};
});