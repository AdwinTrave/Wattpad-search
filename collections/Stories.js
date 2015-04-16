Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("getStories", function(storiesIdsArray){
        return Stories.find({id: storiesIdsArray});
    });
}