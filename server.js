var io = require('socket.io').listen(14006);

// Create storage for our various crews.  Members of those crews are identified by an API KEY (TPSID)
// Ask each crew member asks for a foreman, we return a key that can be used to view the reports.

// We're using socket.io's namespacing to acheive isolation among various crews and crew members (and observers)
// Each crew member has a direct supervisor (session).  For a given member, we create a pointer that
// can be access by supervisors and foremen via namespacing (uri).

// The "Company" controls it all.  It's how crews register for Foremen, Supervisors, and get a place to report

// TODO: Abstract the idea of a "Company" for scalability via application URL, CDN, DNS, or whatever the 'kids' think of next.
// In other words, every crewmember asks the Company for a foreman.
// Lucky for us, they ask with a TPSID (apikey)


/* Good info:
	Get the client IP form socket.io: var address = socket.handshake.address; or maybe socket.remoteAddress;

*/


// Build functions at the top for the time being.
// TODO: Refactor functions into a separate libary

function getSupervisor(APIKEY) {
	// Generate a random seed to prepend to the session
	var seed = Math.floor(Math.random()*10000);
	var thisMoment = getPreciseTime();
	
	seed = seed.toString();
	thisMoment = thisMoment.toString() + seed;
		
	return base_encode(thisMoment);
}

function getPreciseTime() {
	return (new Date).getTime();
}

// Used to generate SHORTCODES from NUMERIC strings ONLY
function base_encode(num, alphabet) {
    // http://tylersticka.com/
    // Based on the Flickr PHP snippet:
    // http://www.flickr.com/groups/api/discuss/72157616713786392/
    alphabet = alphabet || '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var base_count = alphabet.length;
    var encoded = '';
    while (num >= base_count) {
        var div = num/base_count;
        var mod = (num-(base_count*Math.floor(div)));
        encoded = alphabet.charAt(mod) + encoded;
        num = Math.floor(div);
    }
    if (num) encoded = alphabet.charAt(num) + encoded;
    return encoded;
}

// MAIN SOCKET PROCESSING

var foremen = {};
var apikeys = {'L6GYiEn6NPk3qzvZ': {
		allowed : true
	}
};

function setupForeman(foreman) {
	console.log('Setting up new foreman/supervisor for ' + foreman );
	if (!foremen[foreman])
		foremen[foreman] = {};
	
	// Generate new supervisor for this foreman
	supervisor = getSupervisor(foreman);
	var namespaceURL = '/' + foreman + '/' + supervisor;
	
	console.log('Setting up namespace at ' + namespaceURL);
	
	foremen[foreman][supervisor] = io.of('/' + foreman + '/' + supervisor)
	.on('connection',function(socket) {
		// Tell the client to start sending reports here
		socket.emit('GetToWork!');
		console.log('someone connected to ' + supervisor);
		socket.on('log',function(data) {
			// Send a message to everyone listening on this namespace EXCEPT the socket
			console.log('Emitting data from crewmember');
			console.log(data);
			socket.broadcast.send(data);
			// TODO: Store messages for this Foreman for later analysis
		});
	});
	
	return namespaceURL;
}

var theCompany = io
  .of('/foreman')
  .on('connection', function (socket) {
	// A new? crewmember is asking the foreman for a supervisor, so let's generate an ID and get a namespace (supervisor) together
	// We'll ignore this socket in the future (safe?) and tell the crewmember to report to a supervisor (uri)
	
	// Create a new supervisor for this crewmember and attach it to this foreman (APIKEY, TPSID)
	socket.on('supervisor',function(APIKEY, respondToCrewmember) {
		console.log('New cremember asking for supervisor for APIKEY: ' + APIKEY);
		// Make sure the APIKEY is valid, create a new supervisor (session), start listening, and return it.
		if (apikeys[APIKEY] && apikeys[APIKEY].allowed) {
			var thisSupervisor = getSupervisor(APIKEY);
			supervisorNamespace = setupForeman(APIKEY);
			// Add a socket.io listener for each crewmember's supervisor
			// TODO: On Socket.disconnect, remove this item from the foremen object
			console.log('New cremember reporting to: /' + supervisorNamespace);
				
			respondToCrewmember(supervisorNamespace);
		}
	});
    // socket.emit('a message', {
    //         that: 'only'
    //       , '/foreman': 'You will get a supervisor here.'
    //     });
    //     theCompany.emit('a message', {
    //         everyone: 'in'
    //       , '/foreman': 'will get'
    //     });
  });

console.log('The Company is listening.');
console.log(apikeys);
// var news = io
//   .of('/news')
//   .on('connection', function (socket) {
//     socket.emit('item', { news: 'item' });
//   });