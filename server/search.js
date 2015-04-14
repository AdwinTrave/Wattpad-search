/**
 * Server side part of the search
 */

/**
 * Ensure indexes in the DB
 */
Meteor.startup(function () {
    //Need to use decaprated ensureIndex
    // http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/
    //Since miniMongo is still on 2.8
    Stories._ensureIndex({title: "text", description: "text", tags: "text"});
});