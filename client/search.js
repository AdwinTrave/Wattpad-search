Meteor.autorun(function(){
  Session.setDefault("page", 1);
  Session.setDefault("results", null);
  Session.setDefault("totalPages", 1);
});

//results
Template.results.helpers({
  stories: function(){
    getResults();
    return Stories.find({}, {sort: {weight: -1}});
  },
  prevDisabled: function(){
    if(Session.get("page") == 1)
    {
      return true;
    }
    else
    {
      return false;
    }

  },
  nextDisabled: function(){
    if(Session.get("page") == Session.get("totalPages"))
    {
      return true;
    }
    else
    {
      return false;
    }
  },
  category: function(newid){

      var test =  Categories.findOne({"id": newid});
      if(test == undefined){
          return null;
      }
      return test.name;
  },
  currentPage: function(){
    return Session.get("page");
  },
  totalPages: function(){
    return Session.get("totalPages");
  },
  resultsTotal: function(){
    var res = Session.get("results");
    return res.length;
  },
  showStats: function(){
    if(Session.get("results") == null)
    {
      return false;
    }
    return true;
  }
});
//pagination listeners
Template.results.events({
  'click #nextPage': function(event){
    event.preventDefault();
    var currentPage = Session.get("page");
    console.log(currentPage);
    console.log(Session.get("totalPages"));
    if(Session.get("totalPages") > currentPage)
    {
      Session.set("page", currentPage+1);
      window.scrollTo(0, 0);
    }
    else
    {
      console.log("No more pages.");
    }
  },
  'click #prevPage': function(event){
    event.preventDefault();
    var currentPage = Session.get("page");
    if(currentPage > 1)
    {
      Session.set("page", currentPage-1);
      window.scrollTo(0, 0);
    }
    else
    {
      console.log("You are on the first page.");
    }
  }
});

Template.search.events({
  'submit #searchForm': function(event, template){
    //prevent default behavior of refreshing the page
    event.preventDefault();

    var query = $('#searchTerm').val();
    console.log("Query: " + query);
    Session.set("categories", null);

    //step 0: tokenize
    Meteor.apply("tokenize", [query], {wait: true, onResultReceived: function(error, results){
      //console.log("0: " + results);
      //step 1: identify category and remove those words
      Meteor.apply("identifyCategories", [results, false], {wait: true, onResultReceived: function(error, results){
        //split the categoriesResults into the new query and the categories
        //console.log("1: " + results);
        var queryArray = categoriesResultsSplit(results);
        //console.log(queryArray);
        //step 2: remove stop words (and Porter-Stemmer)
        Meteor.apply("stopWordsAndStemer", [queryArray], {wait: true, onResultReceived: function(error, results){
         //console.log("2: " + results);
         //step 2.5: look again for categories
         Meteor.apply("identifyCategories", [results, true], {wait: true, onResultReceived: function(error, results){
           queryArray = categoriesResultsSplit(results);
           console.log(queryArray);
           //console.log("2.5 " + results);
           //step 3: ranked search
           var categories = Session.get("categories");
           Meteor.apply("rankedSearch", [queryArray, categories], {wait: true, onResultReceived: function(error, results){
             //console.log("3: " + results);
             //step 4: display results - get the documents
             //$("#results").text(results.toString());
             console.log(results);
             //subscribe to the documents and Meteor will take care of the rest

             //display searched categories
             var categories = Session.get("categories");
             //console.log(Session.get("categories"));
             if(categories.length > 0)
             {
               var categoriesNames = "";
               for(var i = 0; i < categories.length; i++)
               {
                 var cat = Categories.findOne({"id": categories[i]});
                 //console.log(cat);
                 categoriesNames += '<span class="label">' + cat.name + "</span> ";
               }
               //we have categories show them
               $('#selectedCategories').html("<p>Based on your query we are searching in these categories: " + categoriesNames + "</p>");
             }
             else
             {
               $('#selectedCategories').html("<p>No category recognized from your query.</p>");
             }

             //prep for pagination
             Session.set("totalPages", Math.ceil(results.length/10));
             Session.set("page", 1);
             Session.set("results", results);
             //Removed to solve multiple search issue
             //getResults();
           }});
         }});
        }});
      }});
    }});
  }
});

function categoriesResultsSplit(results)
{
  //split the two arrays by type
  var categories = results[1];

  //get categories into a session
  var prevCategories = Session.get("categories");
  if(prevCategories !== null)
  {
    for(var i = 0; i < prevCategories.length; i++)
    {
      categories.push(prevCategories[i]);
    }
  }
  Session.set("categories", categories);

  //return the tokens
  return results[0];
}

function getResults()
{
  var results = Session.get("results");
  console.log( results );
  Meteor.subscribe("getStories", results, Session.get("page"));
}
