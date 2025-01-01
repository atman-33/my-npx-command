import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const defaultConfig = {
  name: 'hoge',
};

export type Config = typeof defaultConfig;

export const initCommand = new Command('init')
  .description('Initialize my-npx-config.json')
  .action(() => {
    const filePath = path.resolve(process.cwd(), 'my-npx-config.json');

    if (fs.existsSync(filePath)) {
      console.error('my-npx-config.json already exists.');
      process.exit(1);
    }

    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    console.log('my-npx-config.json has been created successfully.');
  });
