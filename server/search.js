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
    //Stories._ensureIndex({title: "text", description: "text", tags: "text"});
});

Meteor.methods({
    //returns tokens
    tokenize: function(query){
        return tokenization(query);
    },
    //returns array of categories and modified query
    identifyCategories: function(queryArray){
        //create an array for categories
        //we need the array to account for additional terms
        console.log(queryArray);
        var categories = Categories.find({}).fetch();
        var searchCategories = [];
        var queryOutput = [];

        for(var i = 0; i < queryArray.length; i++)
        {
            //go with that term through the categories
            categories.some(function(cat)
            {
                //console.log(cat);

                //@todo if the query hints to fanfiction then don't remove the word(s) from query unless it is "fanfiction" or "fan fiction" as the specific fan fiction terms will be needed later
                //@todo stemm and evaluate how stemmed terms effect the search

                //check if the category is a phrase (2+words)
                var phrase = cat.name.split(/[.,\s\-\/*+!#$%&\\()\[\]\"\']+(?!\w+])/);

                var index = queryOutput.indexOf(queryArray[i]);
                var found = false;
                if(index >= 0)
                {
                    found = true;
                }

                if(phrase[0].toLowerCase() == queryArray[i])
                {
                    var match = true;
                    if(phrase.length > 1)
                    {
                        //we have a phrase, check the next words to confirm that this is indeed the category
                        for(var k = 0; k < phrase.length; k++)
                        {
                            if( !(phrase[k].toLowerCase() == queryArray[i+k]) )
                            {
                                match = false;
                            }
                        }
                    }

                    //remove the word from query by not including it in the new query
                    if(!match)
                    {
                        //check that the term already isn't part of the output
                        if(!found)
                        {
                            //console.log("adding " + queryArray[i]);
                            queryOutput.push(queryArray[i]);
                        }
                    }
                    else
                    {
                        //console.log("match-phrase " + cat.name);
                        //add category to search
                        searchCategories = addSearchCategory(cat.id, searchCategories);
                        //now remove from the output array and end the loop for this word
                        if( found )
                        {
                            //console.log("removing " + index + " " + queryArray[i]);
                            queryOutput.splice(index, 1);
                        }
                        //console.log(queryOutput);
                        return true;
                    }
                }
                else if(cat.terms.length > 0)
                {
                    cat.terms.some(function(term)
                    {
                        var token = term.split(/[.,\s\-\/*+!#$%&\\()\[\]\"\']+(?!\w+])/);
                        if(queryArray[i] == token[0].toLowerCase())
                        {
                            //console.log("matched: " + token[0].toLowerCase() + " : " + queryArray[i]);
                            var match = true;
                            if(token.length > 1)
                            {
                                //console.log("Found phrase " + token.length);
                                //we have a phrase, check the next words to confirm that this is indeed the category
                                //we start at 1, because we have already found 0
                                for(var k = 1; k < token.length; k++)
                                {
                                    //console.log(token[k].toLowerCase() + " : " + queryArray[i + k]);
                                    if (token[k].toLowerCase() != queryArray[i + k]) {
                                        match = false;
                                    }
                                }
                            }

                            if(!match)
                            {
                                if(!found){
                                    //console.log("adding2 " + queryArray[i]);
                                    queryOutput.push(queryArray[i]);
                                }
                            }
                            else
                            {
                                //console.log("match2 " + cat.name);
                                //add category to search
                                searchCategories = addSearchCategory(cat.id, searchCategories);
                                //remove all the words from the queryArray to prevent processing
                                if( found )
                                {
                                    //console.log("removing2 " + queryArray[i]);
                                    queryOutput.splice(index, 1);
                                }

                                //remove the words after the start one from the queryArray to prevent future processing
                                queryArray.splice(index+1,token.length-1);

                                return true;
                            }
                        }
                    });
                }
                else
                {
                    //no match
                    if(!found) {
                        //console.log("adding3 " + queryArray[i]);
                        queryOutput.push(queryArray[i]);
                    }
                }
            });
        }

        //console.log(queryOutput);
        //return the modified query
        var returnArray = [queryOutput, searchCategories];
        return returnArray;
    },
    //returns revised tokens
    stopWordsAndStemmer: function(queryArray){
        return stopWordsAndStemm(queryArray);
    },
    //returns an array with ids
    rankedSearch: function(tokens, categories){
        var retrieved = new Array();
        var results = new Array();
        //we need to get the array of tokens into a string for searching
        // Mongo will tokenize on its own
        if(Array.isArray(tokens))
        {
            tokensStr = tokens.toString();
            console.log("Tokens to strign: " + tokensStr);
        }

        if(categories === null)
        {
            retrieved = Stories.find({$text: {$search: tokensStr}}, {fields: {id: 1, title: 1, description: 1, tags: 1}}).fetch();
        }
        else
        {
            retrieved = Stories.find({categories: {$in: categories}, $text: {$search: tokensStr}},
                {fields: {id: 1, title: 1, description: 1, tags: 1}}).fetch();
        }

        var scores = new Array();

        //rank the entries here
        //@todo investigate more the proper weights that we give to each category
        for(var i = 0; i < retrieved.length; i++)
        {
            //first add the story to score with score 0
            var storyID = retrieved[i].id;
            //console.log("Story ID: " + storyID);
            scores.push(new Array(storyID, 0));
            //console.log("SCORES " + scores.toString());

            //tokenize and stemm all the entries
            //tags
            var tags = retrieved[i].tags;
            tags = stopWordsAndStemm(tags);

            //title
            var title = retrieved[i].title;
            console.log(title);
            title = tokenization(title);
            title = stopWordsAndStemm(title);

            //description
            var description = retrieved[i].description;
            description = tokenization(description);
            description = stopWordsAndStemm(description);

            console.log(tokens);

            for(var k = 0; k < tokens.length; k++)
            {
                //console.log(tokens[k]);
                //first start with tags - 100 points
                var evalTags = tags.indexOf(tokens[k]);
                //console.log(evalTags);
                if(evalTags === -1)
                {
                    //token not found
                    //console.log("Token not found in the tags.");
                }
                else
                {
                    //console.log("Token found in the tags.");
                    //add to score
                    scores[i][1] = scores[i][1] + 100;
                }

                //second rank by title - 50 points
                //@todo look for more instances and evaluate how relevant they are
                var evalTitle = title.indexOf(tokens[k]);
                //console.log(evalTitle);
                if(evalTitle === -1)
                {
                    //token not found
                    //console.log("Token not found in the title.");
                }
                else
                {
                    //console.log("Token found in the title.");
                    //add to score
                    scores[i][1] = scores[i][1] + 50;
                }

                //lastly rank by description - 10 points
                //@todo look for more instances and evaluate how relevant they are
                var evalDesc = description.indexOf(tokens[k]);
                //console.log(evalDesc);
                if(evalDesc === -1)
                {
                    //token not found
                    //console.log("Token not found in the description.");
                }
                else
                {
                    //console.log("Token found in the description.");
                    //add to score
                    scores[i][1] = scores[i][1] + 10;
                }
            }
        }

        //sort ranks top to bottom and return
        //console.log(retrieved);
        //console.log("SCORES before sort: " + scores.toString());
        console.log(scores);
        //Sort the results by Score
        var scoresOnly = new Array();
        for(var i = 0; i < scores.length ;i++)
        {
            scoresOnly.push(scores[i][1]);
        }
        scoresOnly.sort(function(a, b){return b-a});

        for(var i = 0; i < scoresOnly.length ;i++)
        {
            for(var j = 0; j < scoresOnly.length ;j++)
            {
                if(scores[j][1] == scoresOnly[i] && results.indexOf(scores[j]) == -1 )
                {
                    results.push(scores[j]);
                }
            }
        }
        return results;
    }
});

/**
 * Add category to the se
 * @var int categoryID
 * @var array arrayCategories
 */
function addSearchCategory(categoryID, arrayCategories)
{
    if(arrayCategories === null)
    {
        arrayCategories = [];
    }

    //check if the given id isn't already included
    if(arrayCategories.indexOf(categoryID) === -1)
    {
        //add the id if not included
        arrayCategories.push(categoryID);
    }

    //DEBUG
    //console.log("Categories selected: " + arrayCategories);

    //return the categories
    if(arrayCategories.length === 0)
    {
        arrayCategories = null;
    }
    return arrayCategories;
}

function tokenization(query)
{
    //separate query into an array of words
    //use space, columns and dots as dividers
    query = query.trim();

    //to lower case
    query = query.toLowerCase();

    //split
    var returnArray = query.split(/[.,\s\-\/*+!#$%&\\()\[\]\"\']+(?!\w+])/);
    //console.log("Tokenize returning: " + EJSON.stringify(returnArray));
    return returnArray;
}

function stopWordsAndStemm(queryArray)
{
    var stopwords = ["a","a's","able","about","above","according","accordingly","across","actually","after","afterwards","again","against","ain't","all","allow","allows","almost","alone","along","already","also","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","aren't","around","as","aside","ask","asking","associated","at","available","away","awfully","b","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","c","c'mon","c's","came","can","can't","cannot","cant","cause","causes","certain","certainly","changes","clearly","co","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldn't","course","currently","d","definitely","described","despite","did","didn't","different","do","does","doesn't","doing","don't","done","down","downwards","during","e","each","edu","eg","eight","either","else","elsewhere","enough","entirely","especially","et","etc","even","ever","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","far","few","fifth","first","five","followed","following","follows","for","former","formerly","forth","four","from","further","furthermore","g","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","h","had","hadn't","happens","hardly","has","hasn't","have","haven't","having","he","he's","hello","help","hence","her","here","here's","hereafter","hereby","herein","hereupon","hers","herself","hi","him","himself","his","hither","hopefully","how","howbeit","however","i","i'd","i'll","i'm","i've","ie","if","ignored","immediate","in","inasmuch","inc","indeed","indicate","indicated","indicates","inner","insofar","instead","into","inward","is","isn't","it","it'd","it'll","it's","its","itself","j","just","k","keep","keeps","kept","know","known","knows","l","last","lately","later","latter","latterly","least","less","lest","let","let's","like","liked","likely","little","look","looking","looks","ltd","m","mainly","many","may","maybe","me","mean","meanwhile","merely","might","more","moreover","most","mostly","much","must","my","myself","n","name","namely","nd","near","nearly","necessary","need","needs","neither","never","nevertheless","new","next","nine","no","nobody","non","none","noone","nor","normally","not","nothing","novel","now","nowhere","o","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","only","onto","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","p","particular","particularly","per","perhaps","placed","please","plus","possible","presumably","probably","provides","q","que","quite","qv","r","rather","rd","re","really","reasonably","regarding","regardless","regards","relatively","respectively","right","s","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","she","should","shouldn't","since","six","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","t","t's","take","taken","tell","tends","th","than","thank","thanks","thanx","that","that's","thats","the","their","theirs","them","themselves","then","thence","there","there's","thereafter","thereby","therefore","therein","theres","thereupon","these","they","they'd","they'll","they're","they've","think","third","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","to","together","too","took","toward","towards","tried","tries","truly","try","trying","twice","two","u","un","under","unfortunately","unless","unlikely","until","unto","up","upon","us","use","used","useful","uses","using","usually","uucp","v","value","various","very","via","viz","vs","w","want","wants","was","wasn't","way","we","we'd","we'll","we're","we've","welcome","well","went","were","weren't","what","what's","whatever","when","whence","whenever","where","where's","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","who's","whoever","whole","whom","whose","why","will","willing","wish","with","within","without","won't","wonder","would","wouldn't","x","y","yes","yet","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves","z","zero"];

    //get rid of stopwords
    var queryArrayFinal = [];
    //need to get rid of jquery in order for this to work
    for(var key in queryArray)
    {
        //console.log(value);
        var index = stopwords.indexOf(queryArray[key].toLowerCase());
        //console.log(index);
        if( !(index >= 0) )
        {
            queryArrayFinal.push(queryArray[key]);
        }
    }

    //stemmer
    for(var key in queryArrayFinal)
    {
        queryArrayFinal[key] = stemmer(queryArrayFinal[key]);
    }

    //return the query as an array
    return queryArrayFinal;
}
