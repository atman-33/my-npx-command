# my-npx-command

A sample CLI tool created using Node.js and `commander`.

## Installation

To use this CLI tool, you don't need to install it globally. Simply run it using `npx`:

```bash
npx my-npx-command

# if my-npx-command conflicts
npx @atman-33/my-npx-command
```

---

## Usage

### Display Help

```bash
npx my-npx-command --help
```

Example output:

```sh
Usage: my-npx-command [options]

sample npx command

Options:
  -V, --version  output the version number
  -h, --help     display help for command
```

### Display Version

```bash
npx my-npx-command --version
```

---

## Available Commands

This CLI tool currently supports the following commands:

- `init`: Initialize a project.
- `hello`: Display a friendly greeting.

### Examples

#### Initialize a project

```bash
npx my-npx-command init
```

#### Display a greeting

```bash
npx my-npx-command hello
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---
