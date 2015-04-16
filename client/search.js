Template.search.helpers({
  categoriesSelected: function(){
    //get the list of categories that were selected for the search
    return Session.get("categories");
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
             $("#results").text(results.toString());
             //subscribe to the documents and Meteor will take care of the rest
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