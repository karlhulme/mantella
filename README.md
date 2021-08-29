# Mantella

An engine for managing multi-step processes with automatic retries, mid-run persistence and resume.

![](https://github.com/karlhulme/mantella/workflows/CD/badge.svg)
[![npm](https://img.shields.io/npm/v/mantella-engine.svg)](https://www.npmjs.com/package/manella-engine)


## Installation

```bash
npm install mantella-engine mentella-express mantella-interfaces
```

## Principles

A Mantella service is concerned only with mutating data by processing a series of steps.  It is not for handling any type of client query.  For this reason, a mantella service should not return data.  Typically a graph service may define mutations that are serviced by a Mantella-based service, and then the graph service can query for data and return that to the client.


## Resolve step

When starting and resuming an operation you can dictate how much of the operation should complete before receiving a response.  Typically a client would wait for an operation to complete in full.  However, you can specify the `resolveStep`.  The engine will then send a response to the `sendResponse` function as soon as the named step is complete.  In addition, you can specify the hat/caret symbol `^`, in which case the engine will send a response as soon as the input has been validated.


## Request vs Operations

A request can complete earlier than an operation.

A request can return successfully, because the latter part of the operation goes on to fail.


## Saving operations

An operation is saved at the end if an error occurs.

An operation is saved at every stage if the request to start the operation included an operationId.

An operation is saved at every stage if the operation definition has the saveProgress flag set.

An operation is saved at every stage if it is resumed (and thus has already been saved once.)


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
