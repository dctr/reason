# What?

REaSoN provides a two-dimensional talk, stored in a GitHub repository.

![Demo Screenshot](/images/screenshot.png "Demo Screenshot")

Start in 2 minutes:

## 1. Create you own talk

Just create a new GitHub repository the usual way and make you initial commit message the first message you want to post.

## 2. Contribute to a talk

Just open the [REaSoN Homepage](http://dctr.github.io/reason "REaSoN Homepage"), log in with your GitHub credentials, and enter the repo path (username/reponame) in the search field to view a repo.

If you have write access to the repo, just click on any message you want to reply to, type your answer, and click the submit button.

# Why?

Common forums often have the following structure:

-   Topic
    -   Re: Topic
        -   Re: Re: Topic
            -   Re: Re: Re: Topic
        -   Re: Re: Topic
    -   Re: Topic

This is because common forums are one-dimensional. REaSoN is a prototype forum that extends the common structure by a second dimension.

Instead of citing or re-ing, you can directly response to any (also multiple) contributions, whereby a two-dimensional graph of response-hierarchy is built.

# How?

REaSoN is a web app based on HTML, CSS, and Javascript. Backend, it uses GitHub to store the talk as a graph.

REaSoN uses
- async
- dagre
- github.js
- jQuery
- mute.js
- Underscore.js

To set up a own topic, just create a repository at GitHub with a README file and enter your first topic text as the commit. Now login in this page, enter the repos path above to see the graph and interact with it. All persons with access to the repository have access to the graph.

# Who?

<dl>
  <dt>Homepage</dt><dd>[https://dctr.github.io](https://dctr.github.io) (WIP)</dd>
  <dt>GitHub Profile</dt><dd>[https://github.com/dctr](https://github.com/dctr)</dd>
</dl>