Stories = new Mongo.Collection("stories");

if(Meteor.isServer)
{
  Meteor.publish("getStories", function(storiesIdsArray, page){
    //calculate the offset
    var offset = (page-1)*10;
    var listOfStories = new Array();

    if(storiesIdsArray != null)
    {
      for(var i = 0; i < storiesIdsArray.length; i++)
      {
        var item = storiesIdsArray[i];
        listOfStories.push(item[0].toString());
      }
      console.log(listOfStories);

      return Stories.find({id: {$in: listOfStories}},
          {fields: {id: 1, title: 1, user: 1, description: 1, cover: 1, categories: 1, tags: 1, url: 1}});
    }
    else
    {
      return Stories.find({},{limit: 10, sort: {id: -1},
        fields: {id: 1, title: 1, user: 1, description: 1, cover: 1, categories: 1, tags: 1, url: 1}});
    }

  });

  Meteor.methods({
    addIndex: function(){
      //Add index
      // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/
      Stories._ensureIndex({title: "text", description: "text", tags: "text"});
    },
    addStory: function(storyObject){
      //console.log(storyObject);
      if(Stories.findOne({id: storyObject.id}) === undefined)
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
            //Stories.update({id: storyObject.id}, {$set: storyObject});
            console.log("Added " + storyObject.id);
            return true;
          }
          else {
            console.log("Not an English story, skipping.");
          }
        }
      }
      else
      {
        console.log("Story " + storyObject.id + " already exists in DB, skipping");
        return false;
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