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
function getSupervisor() {
	return true;
}

var crews = [];
var supervisor = [];

var theCompany = io
  .of('/foreman')
  .on('connection', function (socket) {
	// A new? crewmember is asking the foreman for a supervisor, so let's generate an ID and get a namespace (supervisor) together
	// We'll ignore this socket in the future (safe?) and tell the crewmember to report to a supervisor (uri)
	
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    theCompany.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });