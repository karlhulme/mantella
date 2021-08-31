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
  const myOperation: OperationDefinition<string, string> = {
    name: 'testOp', // name the operation
    inputValidator: () => undefined, // raise an exception if the input is not what you expect 
    saveProgress: false, // set to true if the operation must be saved, useful for critical operations
    func: async ({ log, pause, services, step }) => {
      log({ message: 'open' }) // log messages at any point
      pause(100) // pause execution for a number of milliseconds
      await step({ // execute a step...
        stepName: 'step1', // the name of the step
        func: async () => services.callExternalService('foo'), // the meat of the step that probably makes a network call
        isErrorTransient: err => err.statusCode === 503, // decide which errors are transient so that the engine can keep trying the step
        retryIntervalsInMilliseconds: [100, 200, 400] // the retry strategy expressed as the number of milliseconds between each attempt
      })
    }
  }
```

The last line, `await step(...)` is perhaps the most illustrative.  These are the steps that really define an operation.  The step function parameters are as follows:
* **stepName** - The name of the step.  This is how the engine ensures that each step is only run once, so it must be unique.
* **func** - The actual function to run.  You'll typically want to call external services and databases here.  You can access those via the `services` object that is passed to the Mantella engine when it is created.
* **isErrorTransient** - A function that takes an `Error` and returns true if the error is transient.  This instructs the Mantella engine to keep trying this step until it succeeds.  You can inspect an error's status code or examine its "type" or any other mechanism you want to determine if it's safe to retry.  If an error occurs and it cannot be retried then the operation will fail at this point.
* **retryIntervalsInMilliseconds** - The number of milliseconds between each retry.  You can specify a default set when constructing the Mantella engine.  If you do neither then by default it will retry about 10 times, for up to a minute, using an exponential backoff strategy.

As an alternative to specifying `isErrorTransient`, you can also raise an `OperationTransitoryError` (or a derivative) which is always interpreted as transitory.

Once you've defined a set of operations you can instantiate a Mantella engine.

```typescript
  // Define the services that should be made available to all operations.
  interface MyServices {
    accessToSystem1: () => void
    dataProperty2: string
  }

  // Create a mantella engine.
  const mantella = new Mantella<MyServices>({
    clients: [{
      name: 'admin',
      apiKeys: ['adminKey'],
      operations: true,
      manage: true
    }],
    loadOperationFromDatabase: async () => ({}),
    saveOperationToDatabase: async () => undefined,
    operations: [myOperation],
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


## Shutdown

When a Mantella host is shutdown, you need to complete or interrupt the existing operations.

To do this, ensure the `canContinueProcessing` function passed to the Mantella constructor returns false.  This will prevent Mantella from attempting any more steps.  The existing operations will be marked as `interrupted` and saved to the database.

```typescript
  let running = true
  const isRunning = () => running

  // start listening (assume that app was created using the Getting started guide)
  const server = app.listen(8080, () => {
    console.log(`👣  Server listening...`)
  })

  process.on('SIGTERM', () => {
    console.log('Shutdown requested.')
    server.close() // stop accepting any new connections
    setTimeout(() => { running = false }, 10000) // allow 10 seconds for processing to finish then interrupt 
  })
```

Using the default retry strategies, Mantella should stop processing within 30 seconds.  This depends on the saveOperationToDatabase performing efficiently.  Mantella will not shutdown if operation steps are taking longer than 30 seconds.  Address this by establishing timeouts on those calls, either individually or by providing a client on the Service object with timeouts pre-configured.

You may find that an Express server doesn't shutdown even though Mantella has stopped all processing.  This is likely because some HTTP clients specified the Keep-Alive header and so the connections are still active within Express.  You can use process.exit() if you want to force it to close, but this differs little from allowing a host (such as Kubernetes or Docker) from killing the process anyway.


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
