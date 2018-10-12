global.fetch = require("node-fetch");
var PortalClient = require("../dist/index.js");

var client = new PortalClient.default("");

console.log(client.hasSession);
console.log(client.isAuthenticated);

var response = client.call.Session.Create().response;

response.then(result => {
	console.log(result);
})

console.log("Completed test");