Template.search.events({
  'submit #searchForm': function(event, template){
    //prevent default behavior of refreshing the page
    event.preventDefault();

    var query = $('#searchTerm').val();
    console.log("Query: " + query);

    //step 0: tokenize
    var queryArray = tokenize(query);

    //step 1: identify category and remove those words
    Session.set("categories", null);
    queryArray = categoriesIdentifier(queryArray);

    //step 2: remove stop words (and Porter-Stemmer)
    queryArray = stopWordsRemoval(query);
    console.log("query after stop words and stemmer: " + queryArray);

    //step 2.5: look again for categories
    queryArray = categoriesIdentifier(queryArray);

    //step 3: ranked search

    //step 4: display results - get the documents
  }
});

function tokenize(query)
{
  //separate query into an array of words
  //use space, columns and dots as dividers
  query = query.trim();

  //to lower case
  query = query.toLowerCase();

  //split
  return query.split(/[.,\s\-\/*+!#$%&*\\()\[\]\"\']+(?!\w+])/);
}

//compares the inserted string with our
function stopWordsRemoval(query)
{
  //compare the query array with the stopwords array
  //first get stopwords
  /*var stopwords = HTTP.get(Meteor.absoluteUrl("/stopwords.json"), function(err,result) {
    return result.data;
  });*/
  var stopwords = ["a","a's","able","about","above","according","accordingly","across","actually","after","afterwards","again","against","ain't","all","allow","allows","almost","alone","along","already","also","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","aren't","around","as","aside","ask","asking","associated","at","available","away","awfully","b","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","c","c'mon","c's","came","can","can't","cannot","cant","cause","causes","certain","certainly","changes","clearly","co","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldn't","course","currently","d","definitely","described","despite","did","didn't","different","do","does","doesn't","doing","don't","done","down","downwards","during","e","each","edu","eg","eight","either","else","elsewhere","enough","entirely","especially","et","etc","even","ever","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","far","few","fifth","first","five","followed","following","follows","for","former","formerly","forth","four","from","further","furthermore","g","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","h","had","hadn't","happens","hardly","has","hasn't","have","haven't","having","he","he's","hello","help","hence","her","here","here's","hereafter","hereby","herein","hereupon","hers","herself","hi","him","himself","his","hither","hopefully","how","howbeit","however","i","i'd","i'll","i'm","i've","ie","if","ignored","immediate","in","inasmuch","inc","indeed","indicate","indicated","indicates","inner","insofar","instead","into","inward","is","isn't","it","it'd","it'll","it's","its","itself","j","just","k","keep","keeps","kept","know","known","knows","l","last","lately","later","latter","latterly","least","less","lest","let","let's","like","liked","likely","little","look","looking","looks","ltd","m","mainly","many","may","maybe","me","mean","meanwhile","merely","might","more","moreover","most","mostly","much","must","my","myself","n","name","namely","nd","near","nearly","necessary","need","needs","neither","never","nevertheless","new","next","nine","no","nobody","non","none","noone","nor","normally","not","nothing","novel","now","nowhere","o","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","only","onto","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","p","particular","particularly","per","perhaps","placed","please","plus","possible","presumably","probably","provides","q","que","quite","qv","r","rather","rd","re","really","reasonably","regarding","regardless","regards","relatively","respectively","right","s","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","she","should","shouldn't","since","six","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","t","t's","take","taken","tell","tends","th","than","thank","thanks","thanx","that","that's","thats","the","their","theirs","them","themselves","then","thence","there","there's","thereafter","thereby","therefore","therein","theres","thereupon","these","they","they'd","they'll","they're","they've","think","third","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","to","together","too","took","toward","towards","tried","tries","truly","try","trying","twice","two","u","un","under","unfortunately","unless","unlikely","until","unto","up","upon","us","use","used","useful","uses","using","usually","uucp","v","value","various","very","via","viz","vs","w","want","wants","was","wasn't","way","we","we'd","we'll","we're","we've","welcome","well","went","were","weren't","what","what's","whatever","when","whence","whenever","where","where's","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","who's","whoever","whole","whom","whose","why","will","willing","wish","with","within","without","won't","wonder","would","wouldn't","x","y","yes","yet","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves","z","zero"];
  //console.log(stopwords);

  //get rid of stopwords
  var queryArrayFinal = new Array();
  $.each(queryArray, function(key, value){
    //console.log(value);
    var index = $.inArray(value.toLowerCase(), stopwords);
    //console.log(index);
    if( !(index >= 0) )
    {
      queryArrayFinal.push(value);
    }
  });

  //stemmer
  $.each(queryArrayNext, function(key, value){
    queryArrayFinal[key] = stemmer(value);
  });

  //return the query as an array
  return queryArrayFinal;
}

/**
 * Identifies categories
 * Input queryArray
 * Return queryArray without category words
 */
function categoriesIdentifier(queryArray)
{
  //create an array for categories
  //we need the array to account for additional terms
  var rawCategories = Categories.find({});
  var arrayCategories = Session.get("categories");
  if(arrayCategories === null)
  {
    arrayCategories = new Array();
  }
  //will need to go to lower case

  //compare our arrays

  //set the categories to session
  if(arrayCategories.length === 0)
  {
    arrayCategories = null;
  }
  Session.set("categories", arrayCategories);

  //return the modified query
  return queryArray;
}

/**
 * Ranked search
 */
function searchRank(results)
{
  return results;
}
