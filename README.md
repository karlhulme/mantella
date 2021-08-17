# Mantella

An engine for managing multi-step processes with automatic retries, mid-run persistence and resume.

![](https://github.com/karlhulme/mantella/workflows/CD/badge.svg)
[![npm](https://img.shields.io/npm/v/mantella-engine.svg)](https://www.npmjs.com/package/manella-engine)


## Installation

```bash
npm install mantella-engine mentella-express mantella-interfaces
```


## Development

Code written in Typescript.


## Testing

Tests are written using the `Jest` framework.  100% coverage is required.

```bash
npm test
```


## Build

Type declarations are produced by the typescript compiler `tsc`.  This is configured via the `tsconfig.json` file.  Output is written to the `/types` folder and included in the published npm package.

A CommonJS lib is produced in the `/lib` folder.

```bash
npm run build
```


## Continuous Integration and Deployment

Any pushes or pull-requests on non-master branches will trigger the test runner.

Any pushes to master will cause the library to be re-published.
