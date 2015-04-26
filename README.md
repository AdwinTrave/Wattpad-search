# Wattpad search
This search using Meteor.js framework was created by @AdwinTrave, @umairghazi , @ggduarte1 as a project in a graduate class at Rochester Institute of Technology in Spring 2015.

## Meteor.js
Official website: http://www.meteor.com
Documentation: http://docs.meteor.com
Package site: https://atmospherejs.com/

## Wattpad API docs
http://developer.wattpad.com/docs/api

## Getting started
### Installing Meteor
Windows: https://install.meteor.com/windows

Mac OS X or Linux run the following in terminal:
```
curl https://install.meteor.com/ | sh
```

Now clone the repository, navigate to the directory and run `meteor`. This will start the Meteor server on `http://localhost:3000/`.

First you will need to get some data to work with. There will be a button labeled `Admin` in the right hand corner which will give you access to retrieve date from Wattpad. First retrieve the categories and then retrieve samples from Wattpad. After that you can search through your data.

### Issue with SCSS
Quoting guys from Meteoric (this is the same scss case here):

"Due to a current limitation of the Meteor packaging system, the above paths may not exist the first time you run your Meteor app after installing this package. This will cause an error saying the file to import was not found. This may also occur if you run meteor reset. Restarting your app should fix this problem. See meteor/meteor#2606 and meteor/meteor#2796 for more info."

If you get this issue stop meteor and run it again. Then it should go away.

## App
### Stopwords
Original stopwords file from: https://github.com/6/stopwords/blob/master/dist/en.json
### Stemmer
Stemmer used from: http://tartarus.org/~martin/PorterStemmer/