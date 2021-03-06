#!/usr/bin/env node

/* eslint-disable unicorn/prefer-module */
const process = require('node:process')
const {execSync} = require('child_process')

let scriptFailedRunningCommand = false

const nameOfTool = 'action-promote-semantic-release'
const iconUsedForLoggingCommandsExecuted = "➡️"

const log = message => {
	console.log(`[${nameOfTool}] ${message}`)
}

const logThenExit = (exitCode, message) => {
	// End log group so error message shows up not in a group.

	log(message)

	process.exit(exitCode)
}

const exec = command => {
	if (scriptFailedRunningCommand) {
		log('⚠️ Skipping running command because of previous failure.')
		log(`${iconUsedForLoggingCommandsExecuted} ${command}`)

		return
	}

	log('Running command...')
	log(`${iconUsedForLoggingCommandsExecuted} ${command}`)

	try {
		const stdout = execSync(command).toString().trim()
		log(stdout)

		log('✅ Running command success!')

		return stdout
	} catch (error) {
		if (error.stdout) {
			log(error.stdout.toString())
		}

		if (error.stderr) {
			log(error.stderr.toString())
		}

		log(`❌ Failed to execute command (${command}). You can try fixing the issue and running the tool again or, manually run all of the commands printed by this tool.`)
		scriptFailedRunningCommand = true
	}
}

log(`Welcome to ${nameOfTool} (https://github.com/levibostian/${nameOfTool})!`)
log('This tool is built to execute some git commands meant to trigger a new deployment for your project.')
log('Read the log statements printed to you as the tool runs to learn what it is doing.')
log('\n')
log(`***Note*** This tool is designed to help you in case something goes wrong. Each command to execute is printed to the screen with a ${iconUsedForLoggingCommandsExecuted} icon.`)
log('If any of the commands fails, the tool will tell you what failed and will then print all of the rest of the commands that the tool meant to run.')
log(`This will allow you to run all of the commands (${iconUsedForLoggingCommandsExecuted}) manually yourself if the tool ever fails.`)

log('Setting up script...')

log('Making sure that we have all of the latest changes from the git project.')
exec('git fetch')

const currentBranch = (process.env.GITHUB_REF).replace('refs/heads/', '') // Branch that the workflow got triggered from. In format: "refs/heads/<branch-name>"
log(`Branch workflow triggered from: ${currentBranch}`)
const argv = process.argv.slice(2) // First 2 args are command and file name of script. Remove those.
let sequence = argv[0]
sequence = sequence.split(',')
log(`Ordered sequence of branches to promote to: ${sequence}`)

if (!sequence.includes(currentBranch)) {
	logThenExit(0, `Branch ${currentBranch} is not configured to be updated or promoted. Nothing for me to do here. Exiting.`)
}

let branchBehind
if (sequence.indexOf(currentBranch) > 0) {
	branchBehind = sequence[sequence.indexOf(currentBranch) - 1]
	log(`Branch behind ${currentBranch} (current branch) in sequence: ${branchBehind}`)
}

let branchAhead
if ((sequence.indexOf(currentBranch) + 1) < sequence.length) {
	branchAhead = sequence[sequence.indexOf(currentBranch) + 1]
}

if (!branchAhead) {
	logThenExit(0, `The branch ${currentBranch} is the last branch of the sequence of branches (${sequence}). That means there is no branch to promote ${currentBranch} branch to. Nothing for me to do here. Exiting.....`)
}

log(`Branch ahead in provided sequence: ${branchAhead}`)

let promoteToBranch = argv[1]
// Use default promote branch if argv is not a good format, if branch not in sequence, or if branch is not ahead of current branch in sequence.
if (!promoteToBranch || promoteToBranch === '' || !sequence.includes(promoteToBranch) || sequence.indexOf(promoteToBranch) < sequence.indexOf(currentBranch)) {
	promoteToBranch = branchAhead // Default is to promote to branch ahead.
}

log(`Current branch: ${currentBranch}. Branch we are going to promote to: ${promoteToBranch}`)

log('Setup is complete! Now running commands....')

log(`Checking if branch ${promoteToBranch} exists already...`)
log('Running command "git ls-remote..." and if command prints anything out to us, the branch exists already.')
// If command has any STDOUT, the branch exists.
const promoteToBranchExistsRemote = exec(`git ls-remote --heads $(git config --get remote.origin.url) ${promoteToBranch}`) !== ''
if (promoteToBranchExistsRemote) {
	log(`Branch ${promoteToBranch} *does* exist already. Checking it out now so we can update it.`)
	exec(`git checkout --track origin/${promoteToBranch}`)

	log('Always a good idea to pull the branch to make sure we have all of the latest changes to the branch')
	exec('git pull')

	log(`Merge commits from ${currentBranch} into ${promoteToBranch} so we can give branch ${promoteToBranch} the latest changes.`)
	exec(`git merge --ff ${currentBranch}`)
} else {
	log(`Branch ${promoteToBranch} *does not* exist already. Creating a new branch now.`)
	exec(`git switch --create ${promoteToBranch}`)
}

log(`Now that branch ${promoteToBranch} has all of the latest commits in it, time to push the changes!`)
exec(`git push --set-upstream origin ${promoteToBranch}`)

if (branchBehind) {
	log(`There is a branch behind ${currentBranch} in the sequence: ${branchBehind}. That means branch ${currentBranch} is a temporary release branch. Let's delete ${currentBranch} as it's no longer needed.`)
	log(`Deleting branch: ${currentBranch}`)
	exec(`git push origin --delete ${currentBranch}`)
}

if (scriptFailedRunningCommand) {
	logThenExit(1, 'Looks like a command failed. Exiting the script with an error to notify you to fix it..')
} else {
	log('Done! All commands executed successfully.')
}

