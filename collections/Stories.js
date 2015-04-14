Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("findByCategoriesAndTokens", function(categories, tokens){

        //we need to return the array of tokens into a string for searching
        // Mongo will tokenize on its own
        if(Array.isArray(tokens))
        {
            tokens = tokens.toString();
            //console.log("Tokens to strign: " + tokens);
        }

        if(categories === null)
        {
            return Stories.find({$text: {$search: tokens}}, {id: 1, title: 1, description: 1, tags: 1});
        }
        else
        {
            return Stories.find({categories: {$in: categories}, $text: {$search: tokens}},
                {id: 1, title: 1, description: 1, tags: 1});
        }

    });

    Meteor.publish("getStories", function(storiesIdsArray){
        return Stories.find({id: storiesIdsArray});
    });
}