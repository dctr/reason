# Operating on plain git

1. Store new object in git database use git hash-object -w
2. generate valid tree info
  - git ls-tree master for the current tree
  - append/alter changed element
3. git mktree && git commit-tree

the staging area is in GIT_DIR/index, and doesn't require a working tree
