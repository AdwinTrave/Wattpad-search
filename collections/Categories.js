Categories = new Mongo.Collection("categories");

if(Meteor.isServer)
{
    //publish categories
    Meteor.publish("allCategories", function(){
        return Categories.find({});
    });
}
