var exports = module.exports = {};

const themes = [
	{
		name: "Niebieski (Konosuba - Aqua)",
		id: "blue",
		color: "#03a9f4",
		primary: "light-blue",
		accent: "blue",
		logo: "aqua",
		light: true,
		modifiers: {
			bg: "grey lighten-4",
			nav: "",
			infocards: "lighten-1 white-text",
			text: "black-text"
		}
	},
	{
		name: "Brązowy (SAO - Asuna)",
		id: "brown",
		color: "#5B3A2E",
		primary: "brown",
		accent: "brown",
		logo: "asuna",
		light: false,
		modifiers: {
			bg: "abrown",
			nav: "",
			infocards: "white-text",
			text: "white-text"
		}
	},
	{
		name: "Fioletowy (Nepka)",
		id: "purple",
		color: "#B388FF",
		primary: "deep-purple",
		accent: "purple",
		logo: "nep",
		light: true,
		modifiers: {
			bg: "lighten-4",
			nav: "accent-1",
			infocards: "deep-purple lighten-3 white-text",
			text: "black-text"
		}
	},
	{
		name: "Żółty (Shinobu)",
		id: "yellow",
		color: "#03a9f4",
		primary: "yellow",
		accent: "orange",
		logo: "shinobu",
		light: true,
		modifiers: {
			bg: "lighten-4",
			nav: "darken-1",
			infocards: "lighten-1 white-text",
			text: "black-text"
		}
	},
	{
		name: "Ciemny niebieski (Rikka)",
		id: "dark",
		color: "black",
		primary: "blue-grey",
		accent: "blue-grey darken-1",
		logo: "rikka",
		light: true,
		modifiers: {
			bg: "darken-4",
			nav: "darken-1",
			infocards: "darken-1 white-text",
			text: "white-text"
		}
	},
	{
		name: "Jasny róż (Nekopara - Vanilla)",
		id: "lightpink",
		color: "#E91E63",
		primary: "pink",
		accent: "pink lighten-3",
		logo: "nekopara-vanilla",
		light: true,
		modifiers: {
			bg: "lighten-5",
			nav: "",
			infocards: "white-text",
			text: "black-text"
		}
	},
];

exports.themes = themes;
exports.getTheme = id => {
	if (!id) {
		id = 0;
	} else {
		if (id > themes.length || id < 0) id = 0;
	}
	
	return themes[id];
}