//HELPERS
Template.admin.helpers({
	categoriesNotInDB: function(){
		Meteor.subscribe("allCategories");
		//console.log(Categories.find({}).count());
		return Categories.find({}).count() > 1;
	}
});
//EVENTS
Template.admin.events({
	'click .btn1': function(event, template){
		//prevent default behavior of refreshing the page
		event.preventDefault();
		//get categories
		if(Categories.findOne({}) != null)
		{
			return;
		}
		getCategories();
	},
	'click .btn2': function (event, template) {
		//prevent default behavior of refreshing the page
		event.preventDefault();

		//get the list of categories
		//var categories = Categories.find({});
		var categories = Categories.find({}).fetch();

		//for each loop
		for(var i = 0; i < categories.length; i++)
		{
			getStories(categories[i].id);
			if(i === categories.length)
			{
				alert("Last category processed. You should now have enough data to run the search.");
			}
		}
	}
});
function setAuthorization(xhr)
{
	xhr.setRequestHeader("Authorization", "rFfM7b1aWcKlgwAqxfmshKKLl91LYJX49rA0HsiqJQBp");
}

function getStories(category)
{
	//gettin 100 at one time, this might freeze a browser for a little while
	console.log("Getting the data, this might take a while.");
	var stories = $.ajax({
		type: "GET",
		url: "https://api.wattpad.com:443/v4/stories?filter=new&category="+category+"&limit=100",
		dataType: "json",
		//add the authorization header
		beforeSend: setAuthorization
	}).fail(function(data){
		console.log("Could not retrieve the data.");
		console.log(data);
	});
	//go through each story
	stories.done(function(data){
		var dataArray = data.stories;
		for(var i = 0; i < dataArray.length; i++)
		{
			var storyObject = dataArray[i];
			//first check by story id if it already exists in the DB
			console.log("Adding story " + storyObject.id);
			if(storyObject === undefined)
			{
				console.log("Udenfined story not added.");
			}
			else
			{
				Meteor.call("addStory", storyObject, {onResultReceived: function(error, result){
					if(result)
					{
						console.log("Story " + storyObject.id + " has been added.");
					}
					else
					{
						console.log("Story " + storyObject.id + " already exists in the database.");
					}
				}});
			}
		}
		Meteor.call("addIndex");
	});
}
function getCategories()
{
	console.log('Retrieving Categories');
	var categories = $.ajax({
		type:"GET",
		url: "https://api.wattpad.com:443/v4/categories",
		dataType: "json",
		//add the authorization header
		beforeSend: setAuthorization
	}).fail(function(data){
		alert("failed");
		console.log(data);
	});
	//process the data
	categories.done(function(data){
		var dataArray = data.categories;
		console.log(dataArray);
		for(var i = 0; i < dataArray.length; i++){
			//insert into the DB
			//if the category matches with our predefined terms, add terms
			var terms;
			switch(dataArray[i].name)
			{
				case "Science Fiction":
					terms = ["Scifi", "Sci-fi", "Science"];
					break;
				case "Mystery / Thriller":
					terms = ["Mystery", "Thriller"];
					break;
				case "Historical Fiction":
					terms = ["History", "Historical"];
					break;
				case "Teen Fiction":
					terms = ["Teen"];
					break;
				case "Fanfiction":
					terms = ["Fanfic", "Harry Potter", "Naruto", "Lord of the Rings", "Eragon", "Gundam", "Bleach", "Walking Dead"];
					break;
				case "Poetry":
					terms = ["Poem"];
					break;
				case "General Fiction":
					terms = ["Fiction"];
					break;
				case "Spiritual":
					terms = ["Supernatural"];
					break;
				case "Non-Fiction":
					terms = ["Real Story", "True Story"];
					break;
				default: terms = []; break; //empty array
			}
			Categories.insert({id: dataArray[i].id, name: dataArray[i].name, terms: []})
			//Session.set('stored', Session.get('stored')+1);
			console.log(dataArray[i].name + " Has been added.");
		}
		alert("Retrieved all the categories!");
		console.log(data.categories);
	});
}
