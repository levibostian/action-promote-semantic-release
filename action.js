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
}

startLogGroup('Setting up script...')

const currentBranch = (process.env.GITHUB_REF).replace('refs/heads/', '') // Branch that the workflow got triggered from. In format: "refs/heads/<branch-name>"
log(`Branch workflow triggered from: ${currentBranch}`)
let sequence = process.argv.slice(2)[0] // First 2 args are command and file name of script. Remove those.
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

endLogGroup()

startLogGroup(`Switch to branch ${branchAhead} and copy over commits.`)

log('Checkout branch or create if not exist.')
exec(`git switch --create ${branchAhead}`)
log(`Merge in commits. If branch ${branchAhead} just got created, this command will not do anything.`)
exec(`git merge --ff ${currentBranch}`)

startLogGroup(`Pushing changes to branch ${branchAhead}`)
exec('git push')
endLogGroup()

startLogGroup('Cleanup...')
if (branchBehind) {
	log('There is a branch behind this one in the sequence. That means this branch is a temporary release branch. Action will delete current branch.')
	log(`Deleting branch: ${currentBranch}`)
	exec(`git push origin --delete ${currentBranch}`)
}

endLogGroup()
