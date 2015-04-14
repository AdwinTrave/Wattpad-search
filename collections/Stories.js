Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("findByCategoriesAndTokens", function(categories, tokens){
        return Stories.find({$or: [{categories: categories}, {$text: {title: tokens}}, {$text: {description: tokens}},
            {$text: {tags: tokens}}]}, {id: 1, title: 1, description: 1, tags: 1});
    });
}