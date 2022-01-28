#!/usr/bin/env node

const process = require('process')

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

startLogGroup('Setting up script...')

const currentBranch = (process.env.GITHUB_REF).replace("refs/heads/", "") // Branch that the workflow got triggered from. In format: "refs/heads/<branch-name>"
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

log(`Branch ahead current in sequence: ${branchAhead || 'none'}`)

endLogGroup()

