# Contributing

:+1::+1::+1: JSOxford is entirely volunteer-run, so thanks for helping! :+1::+1::+1:

If you're unsure of anything, have a question or want to find anything out, (come chat with us on Gitter)[https://gitter.im/jsoxford/jsoxford.github.com].

## Issues

* Issues are appropriate for questions, talk ideas, requests for help, pretty much anything.

## Pull Requests

* For general tweaks and improvements to the site, please submit a pull request from your fork to the `develop` branch. For more substantial changes, contentious issues or changes to be released later please submit a pull request to a feature branch (e.g. `feature/adds_unicorns`).
* Ensure any code or content you're submitting can be released under our [license](https://github.com/jsoxford/jsoxford.github.com/blob/master/LICENSE.md).

## Branches

This project uses a modified version of the [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) branching strategy.

* `master` holds the deployed site. There's no source-code there!
* `develop` contains the latest released source. This branch is built and deployed to master on every commit. No commits should ever be made to `develop` directly, instead use a feature branch/forked repository and a pull request.
* Feature branches (prefixed `feature/`) are used to hold changes in development or up for discussion.

## Code style

Consistency is key! We can add more rules here as they crop up.

1. 2-space soft-tabs

### JS

We use [JSCS](http://jscs.info/) to enforce a consistent style across JavaScript files. Currently we are using this [AirBNB](https://github.com/airbnb/javascript) rules. A grunt task is used to enforce a consistent code style.

### (S)CSS

1. One selector per line
2. Space before opening `{`
3. Space before property value (after `:`)
4. Empty line between classes
5. Use explicit properties over shorthand properties
