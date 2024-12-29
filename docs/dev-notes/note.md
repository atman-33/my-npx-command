# TypeScriptを用いたnpxコマンドの開発とnpm公開手順

## はじめに

`npx` コマンドを使うと、ローカルにインストールしなくても npm パッケージを実行できます。本記事では、自作の npx コマンドを TypeScript で作成し、それを `@atman` スコープで npm に公開する方法を解説します。これにより、他のユーザーは `npx @atman/my-npx-command` として簡単にコマンドを実行できるようになります。

:::message
atmanは例ですので、実際にパッケージを自作する場合は、任意のスコープ名に変更してください。
:::

:::details スコープを使うメリット

npm パッケージにスコープを使用することで、いくつかのメリットがあります。

1. **名前の衝突を避ける**  
    スコープを使うことで、同じ名前のパッケージが他のパブリックパッケージと衝突するのを防ぐことができます。例えば、`@atman/my-npx-command` は他のパッケージ名と重なることがありません。

2. **パッケージの管理が容易**  
    スコープは、関連するパッケージをグループ化するために便利です。例えば、`@atman` スコープ内で関連するツールやコマンドをまとめることができ、後から管理しやすくなります。

3. **公開設定の柔軟性**  
    スコープ付きパッケージはデフォルトでプライベートになりますが、`--access public` オプションを使うことで、簡単にパブリックに公開できます。これにより、公開の際にアクセス管理がしやすくなります。

4. **チームや組織向けのパッケージ管理**  
    スコープは、チームや組織専用のパッケージを公開するための名前空間として使用できます。例えば、`@atman` スコープ内のパッケージは、`atman` というチームまたは組織に関連していることが明確になります。

:::

## ステップ

### 1. プロジェクトの作成

#### プロジェクトの初期化

まず、新しいディレクトリを作成し、`npm init`を実行します。  
今回はスコープ付き

```sh
mkdir my-npx-command
cd my-npx-command
npm init --scope=atman

# npm init コマンド実行時の設定
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (@atman/my-npx-command) 
version: (1.0.0) 0.1.0 # セマンティックバージョニングのルールに従って0.1.0から始めることを推奨
description: sample npx command
entry point: (index.js)  # 不要なため後で削除
test command: 
git repository: 
keywords: 
author: atman
license: (ISC) MIT # 仮でMIT
About to write to /home/atman/sites/my-npx-command/package.json:

{
  "name": "@atman/my-npx-command",
  "version": "0.1.0",
  "description": "sample npx command",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "atman",
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

### 2. コマンドの実装

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
         +- index.ts
         +- init.ts   # npxコマンド init の処理部分
         +- hello.ts  # npxコマンド hello の処理部分
```
