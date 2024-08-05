## Contributing guide
### Opening a pull request
- Commit all changes and push to feature branch.
- Fetch changes from origin.
```
git fetch origin
```
- Rebase local branch from origin/main.
- Make sure you're on your feature branch and perform the following:
```
git rebase origin/main
```
- Now youre ready to open a pull request

### Commit messages
- Use descriptive commit messages.
- Commit messages should consist of a heading which includes 1-2 words describing the area the commit modifies.
- Headings should be followed by a ':' and a subheading explaining the change.
- Subheading should begin with an imperative.
- Optionally a description can also be added.
- Each commit should be a separate and coherent idea.
- Example of a good commit message:
```
alarms: Create edit alarm functionality.
```
