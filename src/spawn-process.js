import { spawn } from 'child_process'

// Launches a new process relaying its terminal output and waits for its finish.
export default function spawnProcess(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    // npm is a batch file on Windows, which needs a shel for launching
    const child = spawn(command, args, { cwd, shell: true })
      .on('error', reject)
      .on('exit', code => code ? reject(new Error(`${command} exited with ${code}`)) : resolve())
    child.stdout.on('data', data => process.stdout.write(data.toString()))
    child.stderr.on('data', data => process.stderr.write(data.toString()))
  });
}
