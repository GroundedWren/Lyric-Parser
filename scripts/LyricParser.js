registerNamespace("LyricParser", function (ns)
{
	ns.preStemWord = (word) =>
	{
		return word.toLowerCase().replace(
			/\u003f|!|\u002e|,|\u0022|\u0028|\u0029|'s/g,
			""
		).replace(
			/\u2019|\u2018/g,
			"'"
		).replace(
			/n'/g,
			"ng"
		);
	};
});