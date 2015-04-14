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
  'click .getCat': function(event, template){
    //prevent default behavior of refreshing the page
    event.preventDefault();

    //get categories
    getCategories();
  },
  'click .getStories': function (event, template) {
    //prevent default behavior of refreshing the page
    event.preventDefault();

    //get the list of categories
    var categories = Categories.find({}).fetch();
console.log(categories.length);
console.log(Categories.find({}).fetch());
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

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

function getStories(category)
{
  //gettin 100 at one time, this might freeze a browser for a little while
  //console.log("https://api.wattpad.com:443/v4/stories?filter=new&category="+category+"&limit=100");
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
      //first check by story id if it already exists in the DB
      if(Stories.findOne({id: dataArray[i].id}) == null)
      {
        //there is no entry add the story to DB
        console.log("Adding story " + dataArray[i].id);
        Stories.insert(dataArray[i]);
      }
      else
      {
        console.log("Story " + dataArray[i].id + " already exists in DB, skipping");
      }
    }
    //Add index
    // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/
    Stories._ensureIndex({title: "text", description: "text", tags: "text"});
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

      Categories.insert({id: dataArray[i].id, name: dataArray[i].name, terms: []});
      Session.set('stored', Session.get('stored')+1);
      console.log(dataArray[i].name + " Has been added.");
    }
    alert("Retrieved all the categories!");
    console.log(data.categories);
  });
}
