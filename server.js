//
// belgoserver
// configurable node.js tls+sni server for serving my domains
// belgoserver@cshepherd.fr
//

const express = require('express');
const path = require('path');
const fs = require('fs');
const tls = require('tls');
const config = require('config');
const app = express();

const PORT = config.get('global.tls_port');

const sniCallback = (serverName, callback) => {
//	console.log(serverName);
	let nameParts = serverName.split('.');
	let domainName = nameParts[nameParts.length-2]+'.'+nameParts[nameParts.length-1];

	let cert = null;
	let key = null;

	try {
		const domainConfig = config.hosts[domainName];

		cert = fs.readFileSync(domainConfig.cert).toString();
		cert += fs.readFileSync(domainConfig.chain).toString();

		key = fs.readFileSync(domainConfig.privkey).toString();

		console.log(`Loaded TLS config for domain name ${domainName}`);
	} catch(err) {
//		console.log('Unable to read cert/key for '+domainName);
	}

	callback(null, new tls.createSecureContext({
		cert,
		key,
	}));
}

const serverOptions = {
	SNICallback: sniCallback,

	// Optional: TLS Versions
	maxVersion: 'TLSv1.3',
	minVersion: 'TLSv1.2'
}

const server = require('https').Server(serverOptions, app);

app.get('/', (req, res) => {
	console.log(req.socket.servername);
	res.send(`<h1>Welcome</h1>`);
});

// Start the Server
server.listen(PORT, () => {
	console.log(`[-] Server Listening on Port ${PORT}`);
});