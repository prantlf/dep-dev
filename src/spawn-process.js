import { spawn } from 'child_process'

export default function spawnProcess(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: true })
      .on('error', reject)
      .on('exit', code => code ? reject(new Error(`${command} exited with ${code}`)) : resolve())
    child.stdout.on('data', data => process.stdout.write(data.toString()))
    child.stderr.on('data', data => process.stderr.write(data.toString()))
  });
}
