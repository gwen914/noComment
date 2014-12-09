var SunURI = "https://congress.api.sunlightfoundation.com/legislators/locate?zip=";
var SunURIKey = "&apikey=ec971da0e5fb46c0ae3187b0c2c773d7";
var NYTbaseURL = "http://api.nytimes.com/svc/politics/v3/us/legislative/congress/members/";
var congressKey = "/current.json?api-key=7ed7b4fc1a55c0fe13d052fd45b182e8:8:63556623";
var CKey = "7ed7b4fc1a55c0fe13d052fd45b182e8:8:63556623";
var AKey = "03d4d30364e0db2f88e8411bbf771227:0:63556623";
var reps = {};
var numReps = 0;
var numDems = 0;
var numOther = 0;
var repsLoaded = false;

setStates();

function setStates(){
	reps["AL"] = [];
	reps["AK"] = [];
	reps["AZ"] = [];
	reps["AR"] = [];
	reps["CA"] = [];
	reps["CO"] = [];
	reps["CT"] = [];
	reps["DE"] = [];
	reps["DC"] = [];
	reps["FL"] = [];
	reps["GA"] = [];
	reps["HI"] = [];
	reps["ID"] = [];
	reps["IL"] = [];
	reps["IN"] = [];
	reps["IA"] = [];
	reps["KS"] = [];
	reps["KY"] = [];
	reps["LA"] = [];
	reps["ME"] = [];
	reps["MD"] = [];
	reps["MA"] = [];
	reps["MI"] = [];
	reps["MN"] = [];
	reps["MS"] = [];
	reps["MO"] = [];
	reps["MT"] = [];
	reps["NE"] = [];
	reps["NV"] = [];
	reps["NH"] = [];
	reps["NJ"] = [];
	reps["NM"] = [];
	reps["NY"] = [];
	reps["NC"] = [];
	reps["ND"] = [];
	reps["OH"] = []; 
	reps["OK"] = [];
	reps["OR"] = [];
	reps["PA"] = [];
	reps["RI"] = [];
	reps["SC"] = [];
	reps["SD"] = [];
	reps["TN"] = [];
	reps["TX"] = [];
	reps["UT"] = [];
	reps["VT"] = [];
	reps["VA"] = [];
	reps["WA"] = [];
	reps["WV"] = [];
	reps["WI"] = [];
	reps["WY"] = [];
	reps["AS"] = [];
	reps["GU"] = [];
	reps["VI"] = [];
	reps["PR"] = [];
	reps["MP"] = [];
}

function fillReps(statename, iden, district, zip){
	var URI = 'http://api.nytimes.com/svc/politics/v3/us/legislative/congress/113/house/members/current.json?api-key=';
	URI += CKey;
	$.ajax({
	    url: URI,
	    dataType: 'jsonp',
	    success: function(results){
	    	var members = results.results[0].members;
	    	for (var i = 0; i < members.length; i++) {
	    		var state = members[i].state;
	    		reps[state].push(members[i]);
	    	};
	    	console.log("Done loading state reps!");
	    	repsLoaded = true;
	    	showStateInfo(statename, iden, zip);
			getStateSenate(statename, iden, district);
			var members = reps[iden];
			if (district[0] == 0) {
				// user clicked on map, show all reps in state
				showLegislators(members, "house");
			} else {
				// user entered zip code, show all reps for zip
				var temp = [];
				for (var i = 0; i < members.length; i++) {
					if (members[i].district == district[0]) {
						temp.push(members[i]);
					};
				};
				showLegislators(temp, "house");
			}
	    }
	});
}

function setMarginHeight(){
	$("#info").css("margin-top", $("#navbar").height());
}

// information is the zip code
function getStateZip(zip){
	var URI = SunURI + zip + SunURIKey;
	$.ajax({
	    url: URI,
	    success: function(results){
	    	console.log(results);
	    	if (results.results.length == 0) {
	    		zipErrorMessage(zip);
	    		return;
	    	};
	    	var members = results.results;
	    	var statename = "";
	    	var id = "";
	    	var district = [];
	    	for (var i = 0; i < members.length; i++) {
	    		if (members[i].chamber == "house") {
	    			district.push(members[i].district)
	    		};
	    		statename = members[i].state_name;
	    		id = members[i].state;
	    	};
	    	getLegislators(statename, id, district, zip)
	    }
	});
}

// operating unit to control shit DONE, DOUBLE CHECK
function getLegislators(statename, iden, district, zip){
	numDems=0;
	numReps=0;
	numOther=0;
	if (repsLoaded == false) {
		fillReps(statename, iden, district, zip);
	} else {
		showStateInfo(statename, iden, zip);
		getStateSenate(statename, iden, district);
		var members = reps[iden];
		if (district[0] == 0) {
			// user clicked on map, show all reps in state
			showLegislators(members, "house");
		} else {
			// user entered zip code, show all reps for zip
			var temp = [];
			for (var i = 0; i < members.length; i++) {
				if (members[i].district == district[0]) {
					temp.push(members[i]);
				};
			};
			showLegislators(temp, "house");
		}
	}
}


function getStateSenate(statename, id, district){
	var senateURI = NYTbaseURL + "senate/" + id + congressKey;
	var index = 0;
	$.ajax({
	    url: senateURI,
	    dataType: 'jsonp',
	    success: function(results){
	    	var members = results.results;
	    	showLegislators(members, "senate");
	    }
	});
}


//barebones for this page
function showStateInfo(statename, id, zip){
	html = "<h1 class = 'text-center col-xs-12 col-sm-12 col-md-12'>" + statename + " - " + id + "</h1>";
	if (zip != 0) {
		html += "<h2 class = 'stateZip text-center col-xs-12 col-sm-12 col-md-12'> Zip: " + zip + "</h2>";
	};
	html += '<div class = "col-xs-12 col-sm-12 col-md-12 party-count"><canvas id="partyCount" height="100%"></canvas></div>';
	html += '<div class = "col-xs-12 col-sm-4 col-sm-offset-1 col-md-4 col-md-offset-1 senators text-center"><h3>';
	html += 'Senators</h3></div><div class="col-xs-12 col-sm-4 col-sm-offset-2 col-md-4 col-md-offset-2 house text-center"><h3>Representatives</h3>'
	html += '<div class = "houseRepDiv"></div></div>';
	$("#info").html(html);
	setMarginHeight();
}


function showPartyCount(){
	var ctx = document.getElementById("partyCount").getContext("2d");
	var data = [
	    {
	        value: numReps,
	        color:"#F7464A",
	        highlight: "#FF5A5E",
	        label: "Republican"
	    },
	    {
	        value: numDems,
	        color: "#46BFBD",
	        highlight: "#5AD3D1",
	        label: "Democrat"
	    },
	    {
	    	value: numOther,
	        color: "#FDB45C",
	        highlight: "#FFC870",
	        label: "Other"
	    }
	]
	var myDoughnutChart = new Chart(ctx).Doughnut(data, {responsive : true});
}


//append legislators to page
function showLegislators(results, chamber){
	console.log(results);
	for (var i = 0; i<results.length; i++) {
		var name = results[i].name;
		if (chamber == "house") {
			name = results[i].first_name + " "+results[i].last_name;
		};
		var id = results[i].id;
		var party = results[i].party;
		if (party == "D") {
			numDems++;
		} else if (party == "R") {
			numReps++;
		} else {
			numOther++;
		};
		var district = results[i].district;
		html = '<div class="member"><a><p onclick="hide(); showRepPage(';
		html += "'" + CKey+ "' , '" + AKey + "' , '" + id + "'" + ')">' + name + ' - ';
		html += party + '</p></a></div>'

		if (chamber == 'senate') {
			$(".senators").append(html);
		} else {
			$(".houseRepDiv").append(html);
		} 
	};
	if (chamber == "senate") {
		showPartyCount();
	};
}

function zipErrorMessage(zip){
	html = "<h1 class='text-center err-message'>" + zip + " is not a valid zip code<br>"
	html += "<small>Please try another search</small></h1>"
	$('#info').html(html);
}

function hide(){
	$("#info").html("");
}
