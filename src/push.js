const webpush = require('web-push');


var exports = module.exports = {};
var push = {};

exports.pushNotification = async (body) => {
	try {

var subscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/dmSPTE_K6GM:APA91bGqGsF9DZ4rq9JEXaqS6Uhnqv9ynr9SUQkFbtJUQiT-X5ePk9NfXxO5dXThFdZXXY9YrFv4EPELnmlrwJB6ncMzaOLaks-16i3YA5CZ9wFgJLRyBC8qOoGyxm5Tu2H4l5Vtzr4T","expirationTime":null,"keys":{"p256dh":"BC7-OjaqE4mB35vIK2nLzHn--SW8e4IHEy4z4SpDNOlPO9cglHaLWo-pzfGZtaopzPCog_UVuOKjVXRc7Eut4F4=","auth":"n_hqh6dfiu7eWuqy6nxhaQ=="}};
  const options = {
    vapidDetails: {
      subject: 'https://developers.google.com/web/fundamentals/',
      publicKey: "BESBoop46BrNeH9LtWGVS1iiGJP150rF-ZDSvBsQENa4xAT9b_wel92xF4IedMAfIIWarBHlhTqFnXRpsUo-TbE",
      privateKey: "xJCNFHAgfgCxlLd2_7w3bOE3mDrWItKvD0JfzTNhZq4"
    },
    // 1 hour in seconds.
    TTL: 60 * 60
  };

  webpush.sendNotification(
    subscription,
    body,
    options
  );

	} catch (e) {
		console.error("Wystapił błąd podczas ładowania ustawień!");
		console.error(e.stack);
	}
}
