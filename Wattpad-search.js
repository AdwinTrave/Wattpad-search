if (Meteor.isClient) {

  Template.hello.events({
    'submit #getStories': function (event, template) {
      //prevent default behavior of refreshing the page
      event.preventDefault();

      var category = $("#categoryId").val();

      /* Getting stories by category */
      console.log("Getting category id: " + category);

      getStories(category);
    }
  });
}

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
  //gettin 1000 at one time, this might freeze a browser for a little while
  console.log("https://api.wattpad.com:443/v4/stories?filter=new&category="+category+"&limit=1000");
  var stories = $.ajax({
    type: "GET",
    url: "https://api.wattpad.com:443/v4/stories?filter=new&category="+category+"&limit=1000",
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
    //Count how many stories are stored in the DB for this category
    //console.log(Stories.find({categories: category}).count());
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
    alert("done");
    console.log(data.categories);
    var dataArray = data.categories;
    console.log(dataArray);
    for(var i = 0; i < dataArray.length; i++){
      //insert into the DB
      Categories.insert({id: dataArray[i].id, name: dataArray[i].name, terms: []})
      Session.set('stored', Session.get('stored')+1);
      console.log(dataArray[i].name + " Has been added.");
    }
  });
}
