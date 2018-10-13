global.fetch = require("node-fetch");
var PortalClient = require("../dist/index.js").default;

var client = new PortalClient("");

console.log(client.hasSession);
console.log(client.isAuthenticated);

var call = client.call.Session.Create();

call.response.then(result => {
	console.log(result.Body.Results[0]);
});

call.result.then(result => {
	console.log(result);
});

console.log("Completed test");