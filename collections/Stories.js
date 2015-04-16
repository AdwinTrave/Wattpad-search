Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("getStories", function(storiesIdsArray){
        return Stories.find({id: storiesIdsArray});
    });
}

Stories.allow({
    insert: function (userID, doc) {
        return true;
    },
    update: function(userID, doc){
        return true;
    }
});