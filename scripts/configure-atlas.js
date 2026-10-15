import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { readFile, writeFile, chmod } from 'node:fs/promises';
const host = process.argv[2];
if (!host || !/^[a-zA-Z0-9.-]+\.mongodb\.net$/.test(host)) throw new Error('Provide your Atlas hostname as the first argument.');
const envPath = new URL('../.env', import.meta.url);
process.stdout.write('\nPortfolio Atlas setup\nEnter the password you created for portfolio_app.\nTyping is hidden. Press Enter when finished.\nPassword: ');
const hidden = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
const rl = createInterface({ input: process.stdin, output: hidden, terminal: true });
const password = await new Promise(resolve => rl.question('', resolve));
rl.close();
process.stdout.write('\n');
if (!password) { console.log('No password entered. Settings unchanged.'); process.exit(1); }
let env = await readFile(envPath, 'utf8');
const uri = `mongodb+srv://portfolio_app:${encodeURIComponent(password)}@${host}/Portfolio?retryWrites=true&w=majority`;
env = env.replace(/^MONGODB_URI=.*$/m, () => `MONGODB_URI="${uri}"`);
await writeFile(envPath, env);
await chmod(envPath, 0o600);
console.log('Atlas connection settings saved locally. No password was printed.\nReturn to the chat and say Done so the connection can be tested.');
