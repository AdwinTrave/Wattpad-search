Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("findByCategories", function(categories){
        //return Stories.find({});
        return null;
    })
}