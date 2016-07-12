jsoxford.github.com
===================

[![Slack Status](https://digitaloxford.herokuapp.com/badge.svg)](https://digitaloxford.herokuapp.com) [![Build Status](https://travis-ci.org/jsoxford/jsoxford.github.com.svg?branch=develop)](https://travis-ci.org/jsoxford/jsoxford.github.com) [![Dependency Status](https://dependencyci.com/github/jsoxford/jsoxford.github.com/badge)](https://dependencyci.com/github/jsoxford/jsoxford.github.com)

This is the source for jsoxford.com - it’s a static site that is generated with [jekyll](http://jekyllrb.com/).

### Getting started

_note: if you’ve got a small tweak to make, just edit the file directly in github and send us a PR, you don't have to worry about installing anything_

Requirements:

  * a Ruby environment (hint: [rvm](https://rvm.io/) or [rbenv](https://github.com/sstephenson/rbenv) are handy)
  * [bundler](http://bundler.io/)


```bash
# install jekyll
bundle install

# run the server
bundle exec jekyll serve
```

You should now be able to visit http://localhost:4000 and see the JSOxford site.

### Building an optimised version of the site

The version of the site up on jsoxford.com is optimised to make it quicker to load - you can build that locally with [grunt](http://gruntjs.com/).

```bash
# get the grunt task runner
npm install -g grunt-cli

# install grunt/node project dependencies
npm install

# build a static version of the site
grunt build

# optimise it
grunt optimize
```

Now `_site/` will contain an optimised version of the website, similar to jsoxford.com

If you’re feeling really adventurous, you can deploy it like so:

```bash
grunt deploy
```

Though you shouldn’t need to, we build automatically on Travis.

We’d love for you to make the site prettier/faster/more accessible, just fork and create a pull request (and check out our [contribution guidelines](CONTRIBUTING.md).

### Travis

We continuously build the site using [TravisCI](http://travis-ci.org). The config is in `.travis.yml`. If you’re porting this code to a new repository you’ll also need to replace the two encrypted environment variables:

```bash
travis encrypt GH_LOGIN=YOUR_GITHUB_USERNAME —add
travis encrypt GH_TOKEN=YOUR_APPLICATION_TOKEN —add
```

We have a [Tron-ci](http://tron-ci.herokuapp.com/jobs/1519935/) job to trigger a build every day at midnight, so scheduled pages and/or any time-sensitive preprocessing can occur without us having to modify the repository.

### Requirements

To build this site you’ll need Ruby and Bundler installed (`gem install bundler`) as well as a newish version of NPM.

Content stuff
——————

We link to @jsoxford with [twitter intents](https://dev.twitter.com/docs/intents), so maybe you can use that too? Or not I guess.
