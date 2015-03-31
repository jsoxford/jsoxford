jsoxford.github.com
===================

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jsoxford/jsoxford.github.com?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/jsoxford/jsoxford.github.com.svg?branch=develop)](https://travis-ci.org/jsoxford/jsoxford.github.com)


This is a jekyll/github pages site.  You can run it locally with these commands

```bash
npm install && npm start
```

You can also build and optimise the site separately:
```bash
npm install # install npm, bower and gem dependencies
./node_modules/.bin/grunt build # build the site into _site
./node_modules/.bin/grunt optimize # make it wicked-fast
```

If you're feeling really adventurous, you can deploy it like so:

```bash
npm install && ./node_modules/.bin/grunt deploy
```

Though you shouldn't need to, we build automatically on Travis.

We'd love for you to make the site prettier/faster/more accessible, just fork and create a pull request (and check out our [contribution guidelines](CONTRIBUTING.md).

### Travis

We continuously build the site using [TravisCI](http://travis-ci.org). The config is in `.travis.yml`. If you're porting this code to a new repository you'll also need to replace the two encrypted environment variables:

```bash
travis encrypt GH_LOGIN=YOUR_GITHUB_USERNAME --add
travis encrypt GH_TOKEN=YOUR_APPLICATION_TOKEN --add
```

### Requirements

To build this site you'll need Ruby and Bundler installed (`gem install bundler`) as well as a newish version of NPM.

Content stuff
-------------

We link to @jsoxford with [twitter intents](https://dev.twitter.com/docs/intents), so maybe you can use that too? Or not I guess.
