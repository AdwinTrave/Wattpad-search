Meteor.autorun(function(){
  Session.setDefault("page", 1);
  Session.setDefault("results", null);
  Session.setDefault("totalPages", 0);
});

//results
Template.results.helpers({
  stories: function(){
    getResults();
    return Stories.find({}, {sort: {weight: -1}});
  }
});

//pagination listeners
Template.results.events({

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
      Meteor.apply("identifyCategories", [results], {wait: true, onResultReceived: function(error, results){
        //split the categoriesResults into the new query and the categories
        //console.log("1: " + results);
        var queryArray = categoriesResultsSplit(results);
        //console.log(queryArray);
        //step 2: remove stop words (and Porter-Stemmer)
        Meteor.apply("stopWordsAndStemmer", [queryArray], {wait: true, onResultReceived: function(error, results){
         //console.log("2: " + results);
         //step 2.5: look again for categories
         Meteor.apply("identifyCategories", [results], {wait: true, onResultReceived: function(error, results){
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
               $("#selectedCategories").html("<p>Based on your query we are searching in these categories: " + categoriesNames + "</p>");
             }

             //prep for pagination
             if(results.length > 0)
             {
               $("#results").html("");
               Session.set("totalPages", Math.ceil(results.length/10));
               Session.set("page", 1);
               Session.set("results", results);

               //unsubscribe from the current results

               //get new results
               getResults();
             }
             else
             {
               //unsubscribe from the current results
              $("#results").html("Nothing found. Please try again.");
             }
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