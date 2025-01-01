# my-npx-command

A sample CLI tool created using Node.js and `commander`.

## Installation

To use this CLI tool, you don't need to install it globally. Simply run it using `npx`:

```bash
npx @atman-33/my-npx-command
```

Alternatively, you can install it locally or globally:

### Local Installation

```bash
npm install @atman-33/my-npx-command
```

Run the command:

```bash
npx @atman-33/my-npx-command
```

### Global Installation

```bash
npm install -g @atman-33/my-npx-command
```

Run the command:

```bash
@atman-33/my-npx-command
```

---

## Usage

### Display Help

```bash
npx @atman-33/my-npx-command --help
```

Example output:

```sh
Usage: @atman-33/my-npx-command [options]

sample npx command

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

### Display Version

```bash
npx @atman-33/my-npx-command --version
```

---

## Available Commands

This CLI tool currently supports the following commands:

- `init`: Initialize a project.
- `hello`: Display a friendly greeting.

### Examples

#### Initialize a project

```bash
npx @atman-33/my-npx-command init
```

#### Display a greeting

```bash
npx @atman-33/my-npx-command hello
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---
