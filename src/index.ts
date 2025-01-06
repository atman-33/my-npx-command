#!/usr/bin/env node
// ↑CLIツールとして実行するために必要

import { Command } from 'commander';
import { helloCommand } from './modules/commands/hello';
import { initCommand } from './modules/commands/init';

const program = new Command();

program
  .name('my-npx-command') // CLIツールの名前
  .description('sample npx command')
  .version('0.1.3');

// 各サブコマンドを登録
program.addCommand(initCommand);
program.addCommand(helloCommand);

// コマンドを実行
program.parse(process.argv);
