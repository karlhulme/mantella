# Mantella

An engine for managing multi-step processes with automatic step retries, mid-run persistence and the ability to resume from failed operations from the last successful point.

![](https://github.com/karlhulme/mantella/workflows/CD/badge.svg)
[![npm](https://img.shields.io/npm/v/mantella-engine.svg)](https://www.npmjs.com/package/mantella-engine)


## Installation

```bash
npm install mantella-engine mantella-express mantella-interfaces
```


## Getting Started

Define a series of multi-step operations, each one conforming to the `OperationDefinition` interface.  Within the function, you can call the `step` function whenever you need to issue a request that could fail for transitory reasons.  Once a step has completed successfully it will not be run again - even if the operation is resumed.

```typescript
  const operation: OperationDefinition<string, string> = {
    name: 'testOp', // name the operation
    inputValidator: () => undefined, // raise an exception if the input is not what you expect 
    saveProgress: false, // set to true if the operation must be saved, useful for critical operations
    func: async ({ log, services, step }) => {
      log({ message: 'open' }) // log messages at any point
      await step({ stepName: 'step1', func: async () => 'foo' }) // name each step, and make network/db calls
      // the services property is determined when you create the mantella-engine
    }
  }
```

You can instantiate a Mantella engine by providing functions for reading and writing operations to a database.

```typescript
  // Define the services that should be made available to all operations.
  interface MyServices {
    accessToSystem1: () => void
    dataProperty2: string
  }

  // Create a mantella engine.
  const mantella = new Mantella<MyServices>({
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [],
    services: {
      accessToSystem1: () => undefined,
      dataProperty2: 'example'
    }
  })
```

You can host mantella on a web server using the express handler.

```typescript
  // Start an express web server and mount mantella.
  const mantellaExpress = createMantellaExpress({ mantella })
  const app = express()
  app.use(json())
  app.use('/root', mantellaExpress)
```


## Principles

A Mantella service is concerned only with mutating data by processing a series of steps.  It is not for handling any type of client query.  For this reason, a mantella service should not return data.  Typically a graph service may define mutations that are serviced by a Mantella-based service, and then the graph service can query for data and return that to the client.


## Request vs Operations

Typically a client would wait for an operation to complete in full.  However, a request can complete earlier than an operation.

When starting and resuming an operation you can dictate how much of the operation should complete before receiving a response by specifying a `resolveStep` in the `startOperation` or `resumeOperation` function call.  If interacting via the `mantella-express` wrapper you can specify a `mantella-resolve-step` header value.

The `resolveStep` value refers to the name of the step that you want completed before the call is returned.

You can also specify the hat/caret symbol `^` which indicates the engine should return as soon as the input is validated.


## Saving operations

An operation is saved if an error occurs.

In addition, an operation is saved at every stage of processing if any of the following conditions are met:
* the request to start the operation includes an operationId.
* the operation definition has the saveProgress flag set.
* an operation is resumed (and thus has already been saved once).

Otherwise, an operation is not saved.  This reduces the database IO burden associated with running an operation but it means you cannot review the operation after the event.


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
