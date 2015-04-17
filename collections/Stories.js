Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
    Meteor.publish("getStories", function(storiesIdsArray){
        return Stories.find({id: storiesIdsArray});
    });

    Meteor.methods({
        addIndex: function(){
            //Add index
            // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/
            Stories._ensureIndex({title: "text", description: "text", tags: "text"});
        },
        addStory: function(storyObject){
            //console.log(storyObject);
            if(Stories.findOne({id: storyObject.id}) === null)
            {
                console.log("Story " + storyObject.id + " already exists in DB, skipping");
                return false;
            }
            else
            {
                //there is no entry add the story to DB
                if(storyObject.language === undefined)
                {
                    return false;
                }
                else
                {
                    storyObject.language = storyObject.language.name.toLowerCase();
                    if(storyObject.language === "english")
                    {
                        Stories.insert(storyObject);
                        console.log("Added " + storyObject.id);
                        return true;
                    }
                    else {
                        console.log("Not an English story, skipping.");
                    }
                }
            }
        }
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