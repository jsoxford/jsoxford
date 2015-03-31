jsoxford.github.com
===================

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jsoxford/jsoxford.github.com?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/jsoxford/jsoxford.github.com.svg?branch=develop)](https://travis-ci.org/jsoxford/jsoxford.github.com)


This is a jekyll/github pages site.  You can run it locally with these commands

```bash
# install bundler globally
gem install bundler

# install jekyll (might take a while)
bundle install

# get jekyll to generate and serve the site
bundle exec jekyll server --watch
```

If you change the style.less - you'll need to install less - `npm install -g less` and generate the css with `lessc assets/style.less > assets/style.css`.  More info at the [lesscss site](http://lesscss.org/).  If you want the css to compile automatically you can use watch-lessc - `npm install -g watch-lessc`, then `watch-lessc -i assets/style.less -o assets/style.css`.

If you don't have write access make a pull request to master and maybe poke someone to accept it.

Content stuff
-------------

We link to @jsoxford with [twitter intents](https://dev.twitter.com/docs/intents), so maybe you can use that too? Or not I guess.


Building
--------

The site has an additional deployment step to create an optimised build of the site.  This should run automatically on the CI server, though it's also possible to run locally if you want to debug stuff.

```bash
# install jekyll as above
# ...

# install the grunt cli globally
npm install -g grunt-cli

# install project dependencies
npm install

# serve the site at localhost:5000
grunt

# create an optimised build in ./_site
# see Gruntfile.js for more tasks/details
grunt optimize
```
