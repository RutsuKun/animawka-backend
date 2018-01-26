var exports = module.exports = {};

const themes = [
	{
		name: "Domyślny (Purpura)",
		id: "purple",
		color: "#e040fb",
		primary: "deep-purple",
		accent: "purple",
		logo: "asuna",
		light: false,
		modifiers: {
			bg: "lighten-4",
			nav: "accent-1",
			infocards: "deep-purple lighten-3 white-text"
		}
	},
	{
		name: "Niebieski",
		id: "blue",
		color: "#e040fb",
		primary: "light-blue",
		accent: "blue",
		logo: "asuna",
		light: false,
		modifiers: {
			bg: "grey lighten-4",
			nav: "lighten-1",
			infocards: "lighten-1 white-text"
		}
	}
];

exports.themes = themes;
exports.getTheme = id => {
	if (!id)
		id = 0;
	else if
		(id > id.length || id < 0) id = 0;
	
	return themes[id];
}