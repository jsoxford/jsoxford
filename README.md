jsoxford.github.com
===================

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jsoxford/jsoxford.github.com?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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