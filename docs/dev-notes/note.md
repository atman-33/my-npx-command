# TypeScriptを用いたnpxコマンドの開発とnpm公開手順

## はじめに

`npx` コマンドを使うと、ローカルにインストールしなくても npm パッケージを実行できます。本記事では、自作の npx コマンドを TypeScript で作成し、それを `@atman-33` スコープで npm に公開する方法を解説します。これにより、他のユーザーは `npx @atman-33/my-npx-command` として簡単にコマンドを実行できるようになります。

:::message
atman-33は私のnpmアカウント名ですので、実際にパッケージを自作する場合は、各々のnpmアカウント名に合わせて変更する必要があります。スコープを設定しなくてもパッケージは作成できますので、必要に応じて使い分けてください。
:::

:::details スコープを使うメリット

npm パッケージにスコープを使用することで、いくつかのメリットがあります。

1. **名前の衝突を避ける**  
    スコープを使うことで、同じ名前のパッケージが他のパブリックパッケージと衝突するのを防ぐことができます。例えば、`@atman-33/my-npx-command` は他のパッケージ名と重なることがありません。

2. **パッケージの管理が容易**  
    スコープは、関連するパッケージをグループ化するために便利です。例えば、`@atman-33` スコープ内で関連するツールやコマンドをまとめることができ、後から管理しやすくなります。

3. **公開設定の柔軟性**  
    スコープ付きパッケージはデフォルトでプライベートになりますが、`--access public` オプションを使うことで、簡単にパブリックに公開できます。これにより、公開の際にアクセス管理がしやすくなります。

4. **チームや組織向けのパッケージ管理**  
    スコープは、チームや組織専用のパッケージを公開するための名前空間として使用できます。例えば、`@atman-33` スコープ内のパッケージは、`atman-33` というチームまたは組織に関連していることが明確になります。

:::

**本記事用に作成したサンプルパッケージ**

<https://www.npmjs.com/package/@atman-33/my-npx-command>

<https://github.com/atman-33/my-npx-command>

## npxコマンド作成

### 1. npmアカウント作成

npmアカウントは、CLIで作成します。

```sh
npm adduser
```

上記のコマンド実行後、指示に従ってブラウザ上でアカウント登録を進めます。  

### 2. プロジェクトの作成

#### プロジェクトの初期化

まず、新しいディレクトリを作成し、`npm init`を実行します。  
今回はスコープ付きとしています。

```sh
mkdir my-npx-command
cd my-npx-command
npm init --scope=atman-33 # 作成したnpmアカウント名と合わせること！

# npm init コマンド実行時の設定
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (@atman-33/my-npx-command) 
version: (1.0.0) 0.1.0 # セマンティックバージョニングのルールに従って0.1.0から始めることを推奨
description: sample npx command
entry point: (index.js)  # 不要なため後で削除
test command: 
git repository: 
keywords: 
author: atman-33
license: (ISC) MIT # 今回はMITを設定
About to write to /home/atman/sites/my-npx-command/package.json:

{
  "name": "@atman-33/my-npx-command",
  "version": "0.1.0",
  "description": "sample npx command",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "atman-33",
  "license": "MIT"
}


Is this OK? (yes)
```

#### TypeScriptの設定

必要なパッケージをインストールします。

```sh
npm i -D typescript @types/node ts-node
```

gitを利用している場合は、`node_modules`を含まないように`.gitignore`を準備します。

```sh:.gitignore
/node_modules
```

次に、`tsconfig.json`を作成します。

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "CommonJS",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/**/*.test.ts"
  ]
}
```

:::details tsconfig.jsonの設定について補足

1. **`target: "es2016"`**
   - このオプションは、コンパイル後の JavaScript のターゲットとなる ECMAScript のバージョンを指定します。ここでは `es2016` を指定しており、ES6（ECMAScript 2015）以降の機能を使用しつつ、より新しい ES2016 に対応したコードに変換されます。

2. **`module: "CommonJS"`**
   - このオプションは、モジュールシステムを指定します。`CommonJS` は、Node.js で一般的に使用されるモジュールシステムであり、他の JavaScript ツールやライブラリと互換性があります。

3. **`declaration: true`**
   - このオプションを有効にすると、TypeScript が `.d.ts` ファイル（型定義ファイル）を生成します。このファイルは、TypeScript を使用していない JavaScript プロジェクトでも型チェックを可能にします。npm パッケージとして公開する場合、型情報を提供するために非常に重要です。

4. **`sourceMap: true`**
   - このオプションを有効にすると、TypeScript のソースマップファイル（`.map`）も生成されます。これにより、トランスパイル後の JavaScript コードでエラーが発生した際に、元の TypeScript のソースコードとの対応関係を維持できます。デバッグ時に役立ちます。

5. **`outDir: "./dist"`**
   - コンパイル後に出力される JavaScript ファイルを格納するディレクトリを指定します。ここでは `./dist` フォルダに出力される設定になっています。

6. **`rootDir: "./src"`**
   - ソースコードのルートディレクトリを指定します。ここでは `./src` に指定しており、TypeScript コンパイラがこのディレクトリ内のコードをコンパイルします。

7. **`esModuleInterop: true`**
   - このオプションは、`import` と `require` の互換性を持たせるために使います。これを `true` に設定すると、CommonJS モジュールを ES6 モジュールの形式でインポートできるようになります。

8. **`forceConsistentCasingInFileNames: true`**
   - ファイル名の大文字と小文字の一貫性を強制します。たとえば、`import foo from './Foo'` と `import foo from './foo'` のようにファイル名の大文字小文字が一致しない場合、コンパイルエラーが発生します。これにより、異なるOS間で発生しうるファイルシステムの違いによるバグを防げます。

9. **`strict: true`**
   - TypeScript の厳格な型チェックを有効にします。これにより、型安全が強化され、潜在的なバグを早期に発見しやすくなります。この設定は通常、TypeScript を使用する際におすすめされる設定です。

10. **`skipLibCheck: true`**
    - 型定義ファイルのチェックをスキップします。通常、TypeScript はプロジェクトの依存関係に含まれる型定義ファイル（`*.d.ts`）をチェックしますが、このオプションを有効にすると、外部ライブラリの型定義ファイルのチェックをスキップできます。これによりコンパイル速度が向上することがあります。

11. **`resolveJsonModule: true`**
    - JSON ファイルをモジュールとしてインポートできるようにする設定です。これを有効にすると、`import config from './config.json'` のように、JSON ファイルを直接 TypeScript でインポートできるようになります。

12. **`include: ["src/**/*.ts"]`**

- コンパイル対象として含めるファイルのパターンを指定します。ここでは、`src` フォルダ内のすべての TypeScript ファイル（`.ts`）がコンパイル対象になります。

13. **`exclude: ["src/**/*.test.ts"]`**

- コンパイル対象から除外するファイルのパターンを指定します。テスト用の TypeScript ファイル（`.test.ts`）が含まれる場合は、コンパイル対象から除外することで、不要なファイルを含まないようにできます。

:::

### 3. コマンドの実装

`src` ディレクトリを作成し、その中に実行したいコードを記述します。

```sh
mkdir src
```

今回は、下記のようなディレクトリ構成で実装してみたいと思います。

```sh
+- src/
   |
   +- index.ts        # npxコマンドを登録
   |
   +- modules/
      |
      +- commands/
         |
         +- init.ts   # npxコマンド init の処理部分
         +- hello.ts  # npxコマンド hello の処理部分
```

#### commanderをインストール

Node.js 用コマンドラインインターフェース (CLI) ツールを構築するためのパッケージである`commander`をインストールします。

```sh
npm i commander
```

#### `src/index.ts`の作成

まず、CLI のエントリーポイントとなる`src/index.ts`を作成します。このファイルでは commander を使い、サブコマンドの登録を行います。

```ts:src/index.ts
#!/usr/bin/env node
// ↑CLIツールとして実行するために必要

import { Command } from 'commander';
import { helloCommand } from './modules/commands/hello';
import { initCommand } from './modules/commands/init';

const program = new Command();

program
  .name('my-npx-command') // CLIツールの名前
  .description('sample npx command')
  .version('0.1.0');

// 各サブコマンドを登録
program.addCommand(initCommand);
program.addCommand(helloCommand);

// コマンドを実行
program.parse(process.argv);
```

#### `src/modules/commands/init.ts`の作成

`init`コマンドでは、専用のconfigファイルを生成します。

```ts:src/modules/commands/init.ts
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
```

#### `src/modules/commands/hello.ts`の作成

`hello`コマンドでは、configファイルに設定された`name`に対して、helloと呼びかけます。

```ts:src/modules/commands/hello.ts
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { Config } from './init';

export const helloCommand = new Command('hello').description('Say hello to someone.').action(() => {
  const filePath = path.resolve(process.cwd(), 'my-npx-config.json');

  if (!fs.existsSync(filePath)) {
    console.error(`Configuration file not found at ${filePath}`);
    process.exit(1);
  }

  const config: Config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Hello, ${config.name}!`);
});
```

### 4. コマンドの動作確認

#### `package.json`の修正

`package.json`を修正して、動作確認用のスクリプトを追加します。

```diff json:package.json
{
  "name": "@atman-33/my-npx-command",
  "version": "0.1.0",
  "description": "sample npx command",
- "main": "index.js",  // 不要なため削除
  // ...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
+   "build": "tsc",
+   "start": "node dist/index.js",
+   "--- COMMAND SECTION ---": "---",
+   "init": "npm run build && npm run start init",
+   "hello": "npm run build && npm run start hello"
  },
  // ...
}
```

#### ビルドと実行

以下のコマンドで、CLIの動作を確認します。

```sh
# initコマンドをテスト
npm run init

# helloコマンドをテスト
npm run hello
```

期待通りの出力がされていれば成功です。

また、gitを利用している場合は、`dist`を含まないように`.gitignore`を修正しておきます。

```sh:.gitignore
/node_modules
/dist
```

### 5. npxコマンドの適用

#### `package.json`の`bin`設定

`npx` コマンドとして使用するには、`package.json` にエントリを追加します。

```json:package.json
{
  "bin": {
    "@atman-33/my-npx-command": "dist/index.js"
  }
}
```

これにより、`my-npx-command` コマンドがグローバルに利用可能になります。

#### ローカルでnpx動作確認

次に、ローカルで `npx` 経由で CLI をテストするために、リンクを作成します。

```sh
npm link
```

以下のようにコマンドを実行して動作を確認してください。

```sh
# initコマンド
npx @atman-33/my-npx-command init

# helloコマンド
npx @atman-33/my-npx-command hello
```

ビルドして実行した時と同様の動作となれば成功です。

## npm公開

### 1. npmアカウントログイン

npmログインは、CLIで実行します。

```sh
npm login
```

### 2. `.npmrc`の設定

自作パッケージを誰でも扱えるように、`.npmrc`ファイルを作成し、スコープを設定します。

```sh:.npmrc
access=public
```

### 3. npm公開用に`package.json`を修正

`package.json`に、npm公開用の設定を追加します。

**設定しておくべき項目**

- name
- version
- description
- author
- license
- keywords
- repository
- homepage
- bin
- types
- files

```json:package.json
{
  "name": "@atman-33/my-npx-command",
  "version": "0.1.0",
  "description": "sample npx command",
  "directories": {
    "doc": "docs"
  },
  "author": "atman-33",
  "license": "MIT",
  "keywords": [
    "npx",
    "command"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/atman-33/my-npx-command.git"
  },
  "homepage": "https://github.com/atman-33/my-npx-command",
  "bin": {
    "@atman-33/my-npx-command": "dist/index.js"
  },
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "package.json",
    "LICENSE"
  ],
  "scripts": {
   // ...
  }
}
```

追加した設定の`files`に含まれる、フォルダもしくはファイルがnpmに公開されます。  
TypeScriptの場合、バンドルされた`dist`フォルダは公開に必要ですが、`src`は利用者には不要なため含めないのが基本です。  

また、必要に応じてLICENSE（GitHubからテンプレートをベースに追加可能）、README.mdファイルを追加してください。README.mdは、公開したnpmパッケージのトップに表示されるため、作成しておくことを推奨します。

### 4. npm公開

下記のコマンドで公開します。

```sh
npm publish
```

:::message
npm公開後、npmパッケージのREADMEが更新されるまで時間が掛かることがあります。  
1日程かかる場合もありますので、翌日に更新されているか確認すればOKです。
:::

### 5. 公開済みパッケージ更新

新しいバージョンを公開するには、バージョン番号を変更する必要があります。

**バージョンを更新**  
npm には自動でバージョンを更新するコマンドがあります。

```sh
npm version [update_type]
[update_type] の値には以下を指定します：

patch: 小さなバグ修正（例: 1.0.0 → 1.0.1）
minor: 後方互換性のある新機能追加（例: 1.0.0 → 1.1.0）
major: 後方互換性のない変更（例: 1.0.0 → 2.0.0）
```

:::message
version更新時は、gitコミットされるためご注意ください。
:::

## おわりに

以上の手順で、自作の`npx`コマンドを`@atman-33`スコープで作成し、`npm`に公開することができました。  
公開後も更新や機能追加を行う際は、`npm version`コマンドでバージョンを更新し、再度 `npm publish` してください。

この記事を参考に、ぜひ便利なコマンドを作ってみてください！
