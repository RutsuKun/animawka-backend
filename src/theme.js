var exports = module.exports = {};

const themes = [
	{
		name: "Purpura (Nepka)",
		id: "purple",
		color: "#e040fb",
		primary: "deep-purple",
		accent: "purple",
		logo: "nep",
		light: true,
		modifiers: {
			bg: "lighten-4",
			nav: "accent-1",
			infocards: "deep-purple lighten-3 white-text"
		}
	},
	{
		name: "Niebieski (Aqua)",
		id: "blue",
		color: "#e040fb",
		primary: "light-blue",
		accent: "blue",
		logo: "aqua",
		light: true,
		modifiers: {
			bg: "grey lighten-4",
			nav: "",
			infocards: "lighten-1 white-text"
		}
	},
	{
		name: "Brązowy (Asuna)",
		id: "brown",
		color: "#5B3A2E",
		primary: "brown",
		accent: "brown",
		logo: "asuna",
		light: false,
		modifiers: {
			bg: "grey lighten-4",
			nav: "",
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