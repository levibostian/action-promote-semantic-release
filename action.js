
const log = (message) => {
  console.log(`[action-promote-semantic-release] ${message}`)
}

const startLogGroup = (message) => {
  console.log(`\n::group::${message}`)
}

const endLogGroup = () => {
  console.log("::endgroup::")
}

const logThenExit = (exitCode, message) => {
  // end log group so error message shows up not in a group. 
  end_log_group()

  log(message)

  process.exit(exitCode)
}

startLogGroup("Setting up script...") 

let currentBranch = process.env.GITHUB_REF // branch that the workflow got triggered from
log(`Branch workflow triggered from: ${currentBranch}`)
let sequence = process.argv.slice(2)[0] // first 2 args are command and file name of script. Remove those. 
sequence = sequence.split(",")
log(`Sequence: ${sequence}`)

if (!sequence.includes(currentBranch)) {
  return logThenExit(0, "Branch is not configured to be promoted. Nothing for me to do here. Exiting.")
}

branchBehind = undefined
if (sequence.indexOf(currentBranch) > 0) {
  branchBehind = sequence[sequence.indexOf(currentBranch) - 1]
}
log(`Branch behind current in sequence: ${branchBehind || "none"}`)
branchAhead = undefined
if ((sequence.indexOf(currentBranch) + 1) < sequence.length) {
  branchAhead = sequence[sequence.indexOf(currentBranch) + 1]
}
log(`Branch ahead current in sequence: ${branchAhead || "none"}`)

endLogGroup()

