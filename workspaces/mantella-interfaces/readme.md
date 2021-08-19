# Mantella Interfaces
 
> This package is part of the [Mantella](https://github.com/karlhulme/mantella) family.

![](https://github.com/karlhulme/mentella/workflows/CD/badge.svg)
[![npm](https://img.shields.io/npm/v/mantella-interfaces.svg)](https://www.npmjs.com/package/mantella-interfaces)

A set of **interfaces**, **types**, **function signatures**, **callback signatures** and **errors** used by the packages of the Mantella system.


## Guide

A mantella service is concerned only with mutating data by processing a series of steps.  It is not for handling any type of client query.  For this reason, a mantella service should not return data.


## Installation

```bash
npm install mentella-interfaces
```


## Check

There are no tests for the interface definitions.  You can produce a build to check validity.

```
npm run build
```


## Continuous Deployment

Any pushes or pull-requests on non-master branches will trigger the test runner.

Any pushes to master will cause the family of libraries to be re-published.