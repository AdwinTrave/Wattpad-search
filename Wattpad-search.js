if (Meteor.isClient) {

  Template.hello.events({
    'click button': function () {

      /* Getting stories by category */
      

      /* */

/* Getting categories by hand
      console.log('Retrieving Categories');
      var categories = $.ajax({
        type:"GET",
        url: "https://api.wattpad.com:443/v4/categories",
        dataType: "json",
        //add the authorization header
        beforeSend: setAuthorization
      }).fail(function(data){
        alert("failed");
        console.log(data);
      });
      //process the data
      categories.done(function(data){
        alert("done");
        console.log(data.categories);
        var dataArray = data.categories;
        console.log(dataArray);
        for(var i = 0; i < dataArray.length; i++){
          //insert into the DB
          Categories.insert({id: dataArray[i].id, name: dataArray[i].name, terms: []})
          console.log(dataArray[i].name + " Has been added.");
        }
      });*/
    }
  });
}

function setAuthorization(xhr)
{
  xhr.setRequestHeader("Authorization", "rFfM7b1aWcKlgwAqxfmshKKLl91LYJX49rA0HsiqJQBp");
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
