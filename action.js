#!/usr/bin/env node

const process = require('process')
const {execSync} = require('child_process')

const log = message => {
	console.log(`[action-promote-semantic-release] ${message}`)
}

const startLogGroup = message => {
	console.log(`\n::group::${message}`)
}

const endLogGroup = () => {
	console.log('::endgroup::')
}

const logThenExit = (exitCode, message) => {
	// End log group so error message shows up not in a group.
	endLogGroup()

	log(message)

	process.exit(exitCode)
}

const exec = command => {
	log(`$> ${command}`)

	// Stderr is sent to stderr of parent process
	const stdout = execSync(command)
	log(stdout)

	return stdout 
}

startLogGroup('Setting up script...')

const currentBranch = (process.env.GITHUB_REF).replace('refs/heads/', '') // Branch that the workflow got triggered from. In format: "refs/heads/<branch-name>"
log(`Branch workflow triggered from: ${currentBranch}`)
const argv = process.argv.slice(2) // First 2 args are command and file name of script. Remove those.
let sequence = argv[0]
sequence = sequence.split(',')
log(`Sequence: ${sequence}`)

if (!sequence.includes(currentBranch)) {
	logThenExit(0, 'Branch is not configured to be promoted. Nothing for me to do here. Exiting.')
}

let branchBehind
if (sequence.indexOf(currentBranch) > 0) {
	branchBehind = sequence[sequence.indexOf(currentBranch) - 1]
}

log(`Branch behind current in sequence: ${branchBehind || 'none'}`)
let branchAhead
if ((sequence.indexOf(currentBranch) + 1) < sequence.length) {
	branchAhead = sequence[sequence.indexOf(currentBranch) + 1]
}

if (!branchAhead) {
	logThenExit(0, 'No branch to promote the current branch to. Nothing for me to do here. Exiting.')
}

log(`Branch ahead current in sequence: ${branchAhead || 'none'}`)

let promoteToBranch = argv[1]
// Use default promote branch if argv is not a good format, if branch not in sequence, or if branch is not ahead of current branch in sequence.
if (!promoteToBranch || promoteToBranch === '' || !sequence.includes(promoteToBranch) || sequence.indexOf(promoteToBranch) < sequence.indexOf(currentBranch)) {
	promoteToBranch = branchAhead // Default is to promote to branch ahead.
}

log(`Branch we are going to promote to: ${promoteToBranch}`)

endLogGroup()

startLogGroup(`Switch to branch ${promoteToBranch} and copy over commits.`)

log(`Checking if ${promoteToBranch} exists on remote git repository or not.`)
// if command has any STDOUT, the branch exists. 
let promoteToBranchExistsRemote = exec(`git ls-remote --heads $(git config --get remote.origin.url) ${promoteToBranch}`) != ""
if (promoteToBranchExistsRemote) {
	log(`Branch ${promoteToBranch} does exist on remote git repository already. Pulling it now.`)
	exec(`git checkout --track origin/${promoteToBranch}`)

	log(`Merge commits from ${currentBranch} into ${promoteToBranch}`)
	exec(`git merge --ff ${currentBranch}`)
} else {
	log(`Branch ${promoteToBranch} does not exist on remote git repository already. Creating it now.`)
	exec(`git switch --create ${promoteToBranch}`)
}

startLogGroup(`Pushing changes to branch ${promoteToBranch}`)
exec(`git push --set-upstream origin ${promoteToBranch}`)
endLogGroup()

startLogGroup('Cleanup...')
if (branchBehind) {
	log('There is a branch behind this one in the sequence. That means this branch is a temporary release branch. Action will delete current branch.')
	log(`Deleting branch: ${currentBranch}`)
	exec(`git push origin --delete ${currentBranch}`)
} else {
	log(`Branch is start of sequence. No need to delete branch ${currentBranch}.`)
}

endLogGroup()
