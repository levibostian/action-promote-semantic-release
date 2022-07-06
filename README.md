![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/levibostian/action-promote-semantic-release?label=latest%20stable%20release)
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/levibostian/action-promote-semantic-release?include_prereleases&label=latest%20pre-release%20version)

# action-promote-semantic-release

GitHub Action to promote your code to your next release. Promote develop to alpha, alpha to beta, beta to prod, etc. 

This Action is designed to work well with [semantic-release](https://github.com/semantic-release/semantic-release/) where this Action will manage and push code to branches on your repository. This project does not perform any deployments on it's own. Once this Action pushes code to a branch, semantic-release can then be executed on that branch to then make a deployment. 

# Getting started 

Let's say that your project uses the `develop` branch as the default branch where code gets merged in. From this branch, you make Alpha, Beta and Production releases of your software. 

That means that the *sequence* of releases that you make it: 

```
develop --> alpha --> beta --> production
```

Once you know the sequence that your project follows for releases, the rest is easy! 

```yml
name: Promote releases

on: 
  workflow_dispatch: # manually run this Action so you decide when deployments happen

jobs:
  promote-release:
    name: Promote a branch to the next release 
    runs-on: ubuntu-latest # Action is tested with Linux and it's recommended to use Linux. 
    steps:
      - name: Promote release 
        uses: levibostian/action-promote-semantic-release@v1
        with:
          sequence: "develop,alpha,beta,main"
          githubToken: ${{ secrets.BOT_PUSH_TOKEN }}
```

The action comes with the following inputs:
* `sequence` (required) - comma separated string containing the sequence of your releases that you follow for your project. Each item in the sequence is the name of a branch that you use in your project. 
* `promoteToBranch` (optional) - By default, Action will promote existing branch to next branch in sequence. If you want to instead jump directly to a different branch in the sequence, enter it here.
* `githubToken` (required) - a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) for a GitHub account that has push access to the repository. This Action pushes code to branches of your repository. 

# How does this Action work? 

The tool semantic-release is awesome. Create branches and it will take care of the rest. 

This is the flow of how the workflow operates: 

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbkFbQWN0aW9uIHJ1bnMgd2l0aCBzZXF1ZW5jZS48YnI-Rm9yIGFuIGV4YW1wbGUsIGxldCdzIHNheSBzZXF1ZW5jZSBpczogZGV2ZWxvcCwgYWxwaGEsIGJldGEsIG1haW5dIC0tPiBCKEFjdGlvbiBnZXRzIHRoZSBicmFuY2ggdGhlIEFjdGlvbiBnb3QgdHJpZ2dlcmVkIGZyb20uPGJyPkZvciBhbiBleGFtcGxlLCBsZXQncyBzYXkgdGhhdCBBY3Rpb24gd2FzIHRyaWdnZXJlZCBmcm9tICdhbHBoYScgYnJhbmNoLilcbkIgLS0-IENbRG9lcyBicmFuY2ggZXhpc3QgaW4gdGhlIGdpdmVuIHNlcXVlbmNlPyA8YnI-IEluIG91ciAnYWxwaGEnIGV4YW1wbGUsIHllczogJ2FscGhhJyBleGlzdHMgaW4gc2VxdWVuY2UuXVxuQyAtLT58bm98IERbRXhpdCBBY3Rpb24uIE5vIHByb21vdGlvbiB0byBiZSBkb25lLl1cbkMgLS0-fHllc3wgRVtGcm9tIHRoZSBzZXF1ZW5jZSwgaXMgdGhlcmUgYSBicmFuY2ggKmFmdGVyKiB0aGUgY3VycmVudCBicmFuY2g_PGJyPkV4YW1wbGU6IHRoZXJlIGlzIG5vdCBhIGJyYW5jaCBhZnRlciAnbWFpbicgaW4gc2VxdWVuY2UuPGJyPkZyb20gb3VyIGV4YW1wbGUsICdhbHBoYScgZG9lcyBoYXZlIGEgYnJhbmNoIGFmdGVyIC0tICdiZXRhJy5dXG5FIC0tPnxub3wgRltFeGl0IEFjdGlvbi4gTm8gYnJhbmNoIGFmdGVyIGN1cnJlbnQgb25lIHRvIHByb21vdGUgY29kZSB0by5dXG5FIC0tPnx5ZXN8IEcoRG9lcyB0aGUgbmV4dCBicmFuY2ggZXhpc3QgaW4gdGhlIHJlcG9zaXRvcnkgYWxyZWFkeT8pXG5HIC0tPnxub3wgSChDcmVhdGUgbmV3IGJyYW5jaCBmcm9tIGN1cnJlbnQgYnJhbmNoLjxicj5Gcm9tIG91ciBleGFtcGxlOiBJZiAnYmV0YScgZG9lcyBub3QgZXhpc3QsIG1ha2UgbmV3ICdiZXRhJyBicmFuY2guKVxuRyAtLT58eWVzfCBJKFBlcmZvcm0gYSAnZ2l0IG1lcmdlJyB0byBjb3B5IG5ldyBjb21taXRzIGludG8gZXhpc3RpbmcgbmV4dCBicmFuY2guPGJyPiBGcm9tIG91ciBleGFtcGxlOiBJZiAnYmV0YScgZXhpc3RzIGFscmVhZHksICdnaXQgbWVyZ2UnIGFscGhhIGludG8gYmV0YS4pXG5IIC0tPiBKKFB1c2ggbmV4dCBicmFuY2ggdG8gR2l0SHViLjxicj5Gcm9tIG91ciBleGFtcGxlOiBwdXNoICdiZXRhJyB0byBHaXRIdWIuKVxuSSAtLT4gSiBcbkogLS0-IEsoRnJvbSB0aGUgc2VxdWVuY2UsIGlzIHRoZSBjdXJyZW50IGJyYW5jaCBmaXJzdCBvciBsZWFzdD88YnI-RnJvbSBvdXIgZXhhbXBsZTogJ2FscGhhJyBpcyBub3QgZmlyc3Qgb3IgbGFzdC4pXG5LIC0tPnx5ZXN8IEwoRXhpdCBBY3Rpb24uIERvbmUhKVxuSyAtLT58bm98IE0oRGVsZXRlIGN1cnJlbnQgYnJhbmNoIGZyb20gR2l0SHViLjxicj5Gcm9tIG91ciBleGFtcGxlOiBEZWxldGUgJ2FscGhhJyBicmFuY2ggc2luY2UgaXQgZ290IHByb21vdGVkIHRvICdiZXRhJy4pIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit/#eyJjb2RlIjoiZ3JhcGggVERcbkFbQWN0aW9uIHJ1bnMgd2l0aCBzZXF1ZW5jZS48YnI-Rm9yIGFuIGV4YW1wbGUsIGxldCdzIHNheSBzZXF1ZW5jZSBpczogZGV2ZWxvcCwgYWxwaGEsIGJldGEsIG1haW5dIC0tPiBCKEFjdGlvbiBnZXRzIHRoZSBicmFuY2ggdGhlIEFjdGlvbiBnb3QgdHJpZ2dlcmVkIGZyb20uPGJyPkZvciBhbiBleGFtcGxlLCBsZXQncyBzYXkgdGhhdCBBY3Rpb24gd2FzIHRyaWdnZXJlZCBmcm9tICdhbHBoYScgYnJhbmNoLilcbkIgLS0-IENbRG9lcyBicmFuY2ggZXhpc3QgaW4gdGhlIGdpdmVuIHNlcXVlbmNlPyA8YnI-IEluIG91ciAnYWxwaGEnIGV4YW1wbGUsIHllczogJ2FscGhhJyBleGlzdHMgaW4gc2VxdWVuY2UuXVxuQyAtLT58bm98IERbRXhpdCBBY3Rpb24uIE5vIHByb21vdGlvbiB0byBiZSBkb25lLl1cbkMgLS0-fHllc3wgRVtGcm9tIHRoZSBzZXF1ZW5jZSwgaXMgdGhlcmUgYSBicmFuY2ggKmFmdGVyKiB0aGUgY3VycmVudCBicmFuY2g_PGJyPkV4YW1wbGU6IHRoZXJlIGlzIG5vdCBhIGJyYW5jaCBhZnRlciAnbWFpbicgaW4gc2VxdWVuY2UuPGJyPkZyb20gb3VyIGV4YW1wbGUsICdhbHBoYScgZG9lcyBoYXZlIGEgYnJhbmNoIGFmdGVyIC0tICdiZXRhJy5dXG5FIC0tPnxub3wgRltFeGl0IEFjdGlvbi4gTm8gYnJhbmNoIGFmdGVyIGN1cnJlbnQgb25lIHRvIHByb21vdGUgY29kZSB0by5dXG5FIC0tPnx5ZXN8IEcoRG9lcyB0aGUgbmV4dCBicmFuY2ggZXhpc3QgaW4gdGhlIHJlcG9zaXRvcnkgYWxyZWFkeT8pXG5HIC0tPnxub3wgSChDcmVhdGUgbmV3IGJyYW5jaCBmcm9tIGN1cnJlbnQgYnJhbmNoLjxicj5Gcm9tIG91ciBleGFtcGxlOiBJZiAnYmV0YScgZG9lcyBub3QgZXhpc3QsIG1ha2UgbmV3ICdiZXRhJyBicmFuY2guKVxuRyAtLT58eWVzfCBJKFBlcmZvcm0gYSAnZ2l0IG1lcmdlJyB0byBjb3B5IG5ldyBjb21taXRzIGludG8gZXhpc3RpbmcgbmV4dCBicmFuY2guPGJyPiBGcm9tIG91ciBleGFtcGxlOiBJZiAnYmV0YScgZXhpc3RzIGFscmVhZHksICdnaXQgbWVyZ2UnIGFscGhhIGludG8gYmV0YS4pXG5IIC0tPiBKKFB1c2ggbmV4dCBicmFuY2ggdG8gR2l0SHViLjxicj5Gcm9tIG91ciBleGFtcGxlOiBwdXNoICdiZXRhJyB0byBHaXRIdWIuKVxuSSAtLT4gSiBcbkogLS0-IEsoRnJvbSB0aGUgc2VxdWVuY2UsIGlzIHRoZSBjdXJyZW50IGJyYW5jaCBmaXJzdCBvciBsZWFzdD88YnI-RnJvbSBvdXIgZXhhbXBsZTogJ2FscGhhJyBpcyBub3QgZmlyc3Qgb3IgbGFzdC4pXG5LIC0tPnx5ZXN8IEwoRXhpdCBBY3Rpb24uIERvbmUhKVxuSyAtLT58bm98IE0oRGVsZXRlIGN1cnJlbnQgYnJhbmNoIGZyb20gR2l0SHViLjxicj5Gcm9tIG91ciBleGFtcGxlOiBEZWxldGUgJ2FscGhhJyBicmFuY2ggc2luY2UgaXQgZ290IHByb21vdGVkIHRvICdiZXRhJy4pIiwibWVybWFpZCI6IntcbiAgXCJ0aGVtZVwiOiBcImRhcmtcIlxufSIsInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)

# Development 

This action is a [composite GitHub Action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) mostly relying on bash scripts to run commands. This means there is nothing for you to install to create a development environment on your computer. However, this also means that testing the action is more difficult. To test this action, we rely on running the action on GitHub Actions. See `.github/workflows/test-action.yml` for an example of how we test this action. 

All changes made to the code require making a pull request into `develop` branch with the title conforming to the [conventional commit format](https://www.conventionalcommits.org/).

Before pushing code, it would be nice if you would lint it. `npm i -g xo && xo --fix` will do the trick. 

# Deployment

Tags/releases are made automatically using [semantic-release](https://github.com/semantic-release/semantic-release) as long as our git commit messages are written in the [conventional commit format](https://www.conventionalcommits.org/). Just `git rebase ...` or `git merge` commits from `develop` into `alpha`, `beta`, or `main` to make a new deployment of the action. 


