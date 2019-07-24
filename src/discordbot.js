exports.sendMessageEmbed = async (channel, title, description, url, imageurl, client) => {
    await client.channels.get(channel).send({embed: {
        color: 3447003,
        author: {
        name: client.user.username,
        icon_url: client.user.avatarURL
        },
        title: title,
        url:url,
        description: description,
        timestamp: new Date(),
        footer: {
        icon_url: client.user.avatarURL,
        text: "Copyright © 2019 Animawka Backend"
        },
        image: {
        url: imageurl
        }
        }
        });
}

