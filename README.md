![axiom](axiom.jpg)

[Axios](https://www.npmjs.com/package/axios) as a Redux Middleware, by [Victor Buzzegoli](https://twitter.com/victorbuzzegoli)

Lightweight, Powerfull, _MMMM_ compliant (check out : [Modern Modular Middleware Model](https://github.com/vbuzzegoli/4m))

## Installation

To install **Axiom** in your project, navigate to your project folder in your terminal and run :

    npm i --save axios redux-axiom

> Note that `Axiom` requires `Axios` to run properly

## Setup

To start using **Axiom**, you will first need to apply the middleware to your store, just like any redux middleware :

    ...
    import axiom from "redux-axiom";
    ...
    export default createStore(rootReducer,applyMiddleware([axiom]));

## Usage

### Basic REST call

> Using ES6+ syntax

**Without** Axiom (using redux-thunk) :

    import axios from "axios";
    import * as actions from "../constants/action-types";

    export const fetchApi = () => dispatch => {
      const url = `https://itunes.apple.com/search?term=hello`;
      return axios
        .get(url)
        .then(promise =>
          dispatch({
            type: actions.FETCH_API,
            payload: promise.data
          })
        );
    };

**With** Axiom (_MMMM_ compliant) :

    import * as actions from "../constants/action-types";

    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        }
      }
    }

> Note that `axios` is an object supporting any configuration available via [Axios API](https://www.npmjs.com/package/axios#axios-api). Check out `Axios` documentation to know about the different arguments available.

### Basic REST call with (pre-networking) throttling

> Using ES6+ syntax

**Without** Axiom (using redux-thunk) :

    //Too long to be shown here
    //Code grows exponentially

**With** Axiom (_MMMM_ compliant) :

    import * as actions from "../constants/action-types";

    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        },
        throttle: 3000
      }
    }

> Note that **Axiom**'s throttling module is also available as a _standalone middleware_ in a more advanced verson. If you only need to throttle your actions, or need to use more advanced features such as throttling based reactions, please check out [Hurakken](https://github.com/vbuzzegoli/hurakken), a lightweight and _MMMM_ compliant Redux Middleware.

> `throttle` is a value in **milliseconds** for which this action will not be dispatchable again. Note that due to Javascript single threaded environment, this value can be subject to slight variant, and is therefore not precisely defined.

#### Behaviour

- By default, on success, the `payload` will be overridden by `promise.data`, and the action will be passed to the reducer (or next middleware).

- To prevent the extraction of the `data`, you can disable it manually by adding `extractData: false` to `axiom`.

- Use `onSuccess`, `onError`, and `onUnexpected Status` to override the default behaviour

> Note that these functions are called **reactions**, accordingly to the [Modern Modular Middleware Model](https://github.com/vbuzzegoli/4m). Therefore they contain a `next` argument that can be use to release an action to the reducer (or next middleware). They can be used like :

In `/reactions` :

    export const customReaction = (newAction, next) => {
      console.log("SUCCESS!", newAction);
      next(newAction);
    };

In `/actions` :

    import * as actions from "../constants/action-types";
    import { customReaction } from "../reactions/customReaction";

    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        }
        onSuccess: customReaction
      }
    }

> If you were to use a non 4M compliant middleware such as _redux-thunk_, which is **deprecated by the [4M documentation](https://github.com/vbuzzegoli/4m)**, please note that, by default, using/dispatching the action returned by `onSuccess` or `onUnexpectedStatus` will not trigger _Axiom_ again even though the arguments are still contained in the action's parameters. To force triggering _Axiom_ again, use : `_skip: false` or remove `_skip` in the `axiom` node.

- Use `log: true` to print the middleware logs in the console (add `xlog: true` for extended logs)

- Supports Axios's _interceptors_

Here is a overview of every options possible:

    axiom: {
      throttle: 3000,
      log: true,
      xlog: true,
      axios: {
        // e.g. Axios API's Documentation
        //...
      },
      extractData: false,
      onSuccess: (action, next) => {
        //...
      },
      onError: (error, prevAction, next) => {
        //...
      },
      onUnexpectedStatus: (promise, prevAction, next) => {
        //...
      },
      interceptors: {
        request: {
          config: (config) => {
            //...
            return config;
          },
          error: (error) => {
            //...
            return Promise.reject(error);
          }
        },
        response: {
          config: (config) => {
            //...
            return config;
          },
          error: (error) => {
            //...
            return Promise.reject(error);
          }
        }
      }
    }

## Version

1.2.3

## License

**The MIT License**

Copyright 2018 - Victor Buzzegoli

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contact

[@victorbuzzegoli](https://twitter.com/victorbuzzegoli) on Twitter
