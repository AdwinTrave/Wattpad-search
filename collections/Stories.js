Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("getStories", function(storiesIdsArray){
        return Stories.find({id: storiesIdsArray});
    });

    //Add index
    // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/
    Stories._ensureIndex({title: "text", description: "text", tags: "text"});
}

Stories.allow({
    insert: function (userID, doc) {
        return true;
    },
    update: function(userID, doc){
        return true;
    }
});