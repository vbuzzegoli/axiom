![axiom](axiom.jpg)

[Axios](https://www.npmjs.com/package/axios) as a Redux Middleware, by [Victor Buzzegoli](https://twitter.com/victorbuzzegoli)

Lightweight, Powerfull, _4M_ 1.6 compliant (check out : [Modern Modular Middleware Model](https://github.com/vbuzzegoli/4m))

## Installation

To install **Axiom** in your project, navigate to your project folder in your terminal and run :

    npm i --save axios redux-axiom

> Note that `Axiom` requires `Axios` to run properly

## Setup

To start using **Axiom**, you will first need to apply the middleware to your store, just like any redux middleware :

```javascript
    ...
    import axiom from "redux-axiom";
    ...
    export default createStore(rootReducer,applyMiddleware([axiom]));
```

## Usage

### Basic REST call

> Using ES6+ syntax

**Without** Axiom (using redux-thunk) :

```javascript
import axios from "axios";
import * as actions from "../constants/action-types";

export const fetchApi = () => dispatch => {
  const url = `https://itunes.apple.com/search?term=hello`;
  return axios.get(url).then(promise =>
    dispatch({
      type: actions.FETCH_API,
      payload: promise.data
    })
  );
};
```

**With** Axiom (_4M_ compliant) :

```javascript
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
```

> Note that `axios` is an object supporting any configuration available via [Axios API](https://www.npmjs.com/package/axios#axios-api). Check out `Axios` documentation to know about the different arguments available.

### Basic REST call with (pre-networking) throttling

> Using ES6+ syntax

**Without** Axiom (using redux-thunk) :

```javascript
//Too long to be shown here
//Code grows exponentially
```

**With** Hurakken & Axiom (_4M_ compliant) :

```javascript
    import * as actions from "../constants/action-types";

    export const fetchApi = () => {
      type: actions.FETCH_API,
      payload: [],
      hurakken: {
        throttle: 3000
      },
      axiom: {
        axios: {
          method:`get`,
          url:`https://itunes.apple.com/search?term=hello`
        }
      }
    }
```

> Check out [Hurakken](https://github.com/vbuzzegoli/hurakken), a lightweight and _4M_ compliant Redux Middleware, used for throttling.

> `throttle` is a value in **milliseconds** for which this action will not be dispatchable again. Note that due to Javascript single threaded environment, this value can be subject to slight variant, and is therefore not precisely defined.

#### Behaviour

- By default, on success, the `payload` will be overridden by `promise.data` (if the data is of type _json_), and the action will be passed to the reducer (or next middleware).

- To prevent the extraction of the `data`, you can disable it manually by adding `extractData: false` to `axiom`.

- Use `onSuccess`, `onError`, and `onUnexpected Status` to override the default behaviour

> Note that these functions are called **reactions**, accordingly to the [Modern Modular Middleware Model](https://github.com/vbuzzegoli/4m). Therefore they contain a `next` argument that can be use to release an action to the reducer (or next middleware). They can be used like :

In `/reactions` :

```javascript
export const customReaction = (newAction, next, dispatch) => {
  console.log("SUCCESS!", newAction);

  dispatch({ type: `ANOTHER_ACTION`, payload: 0 });
  dispatch({ type: `YET_ANOTHER_ACTION`, payload: 0 });

  next(newAction);
};
```

In `/actions` :

```javascript
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
```

> If you were to use a non 4M compliant middleware such as _redux-thunk_, which is **deprecated by the [4M documentation](https://github.com/vbuzzegoli/4m)**, please note that, by default, using/dispatching the action returned by `onSuccess` or `onUnexpectedStatus` will not trigger _Axiom_ again even though the arguments are still contained in the action's parameters. To force triggering _Axiom_ again, use : `_skip: false` or remove `_skip` in the `axiom` node.

- Use `log: true` to print the middleware logs in the console (add `xlog: true` for extended logs)

- Supports Axios's _interceptors_

Here is a overview of every options possible:

```javascript
    axiom: {
      log: true,
      xlog: true,
      axios: {
        // e.g. Request Config below
        //...
      },
      extractData: false,
      onSuccess: (action, next, dispatch) => {
        //...
      },
      onError: (error, prevAction, next, dispatch) => {
        //...
      },
      onUnexpectedStatus: (promise, prevAction, next, dispatch) => {
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
```

## Request Config

These are the available config options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

```js
{
  // `url` is the server URL that will be used for the request
  url: '/user',

  // `method` is the request method to be used when making the request
  method: 'get', // default

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance.
  baseURL: 'https://some-domain.com/api/',

  // `transformRequest` allows changes to the request data before it is sent to the server
  // This is only applicable for request methods 'PUT', 'POST', and 'PATCH'
  // The last function in the array must return a string or an instance of Buffer, ArrayBuffer,
  // FormData or Stream
  // You may modify the headers object.
  transformRequest: [function (data, headers) {
    // Do whatever you want to transform the data

    return data;
  }],

  // `transformResponse` allows changes to the response data to be made before
  // it is passed to then/catch
  transformResponse: [function (data) {
    // Do whatever you want to transform the data

    return data;
  }],

  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `params` are the URL parameters to be sent with the request
  // Must be a plain object or a URLSearchParams object
  params: {
    ID: 12345
  },

  // `paramsSerializer` is an optional function in charge of serializing `params`
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },

  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
  // When no `transformRequest` is set, must be of one of the following types:
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - Browser only: FormData, File, Blob
  // - Node only: Stream, Buffer
  data: {
    firstName: 'Fred'
  },

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  timeout: 1000, // default is `0` (no timeout)

  // `withCredentials` indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  withCredentials: false, // default

  // `adapter` allows custom handling of requests which makes testing easier.
  // Return a promise and supply a valid response (see lib/adapters/README.md).
  adapter: function (config) {
    /* ... */
  },

  // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
  // This will set an `Authorization` header, overwriting any existing
  // `Authorization` custom headers you have set using `headers`.
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  },

  // `responseType` indicates the type of data that the server will respond with
  // options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  responseType: 'json', // default

  // `responseEncoding` indicates encoding to use for decoding responses
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  responseEncoding: 'utf8', // default

  // `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
  xsrfCookieName: 'XSRF-TOKEN', // default

  // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
  xsrfHeaderName: 'X-XSRF-TOKEN', // default

  // `onUploadProgress` allows handling of progress events for uploads
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },

  // `onDownloadProgress` allows handling of progress events for downloads
  onDownloadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },

  // `maxContentLength` defines the max size of the http response content in bytes allowed
  maxContentLength: 2000,

  // `validateStatus` defines whether to resolve or reject the promise for a given
  // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
  // or `undefined`), the promise will be resolved; otherwise, the promise will be
  // rejected.
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },

  // `maxRedirects` defines the maximum number of redirects to follow in node.js.
  // If set to 0, no redirects will be followed.
  maxRedirects: 5, // default

  // `socketPath` defines a UNIX Socket to be used in node.js.
  // e.g. '/var/run/docker.sock' to send requests to the docker daemon.
  // Only either `socketPath` or `proxy` can be specified.
  // If both are specified, `socketPath` is used.
  socketPath: null, // default

  // `httpAgent` and `httpsAgent` define a custom agent to be used when performing http
  // and https requests, respectively, in node.js. This allows options to be added like
  // `keepAlive` that are not enabled by default.
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  // 'proxy' defines the hostname and port of the proxy server.
  // You can also define your proxy using the conventional `http_proxy` and
  // `https_proxy` environment variables. If you are using environment variables
  // for your proxy configuration, you can also define a `no_proxy` environment
  // variable as a comma-separated list of domains that should not be proxied.
  // Use `false` to disable proxies, ignoring environment variables.
  // `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
  // supplies credentials.
  // This will set an `Proxy-Authorization` header, overwriting any existing
  // `Proxy-Authorization` custom headers you have set using `headers`.
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  },

  // `cancelToken` specifies a cancel token that can be used to cancel the request
  // (see Cancellation section below for details)
  cancelToken: new CancelToken(function (cancel) {
  })
}
```

## Response Schema

The response for a request contains the following information.

```js
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the headers that the server responded with
  // All header names are lower cased
  headers: {},

  // `config` is the config that was provided to `axios` for the request
  config: {},

  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance the browser
  request: {}
}
```

> Note that by default, the payload will contain only the `data` from the response. To prevent the extraction of the `data`, you can disable it manually by adding `extractData: false` to `axiom`.

## Handling Errors

Errors can be handled using the `onError` _reaction_.

```js
if (error.response) {
  // The request was made and the server responded with a status code
  // that falls out of the range of 2xx
  console.log(error.response.data);
  console.log(error.response.status);
  console.log(error.response.headers);
} else if (error.request) {
  // The request was made but no response was received
  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
  // http.ClientRequest in node.js
  console.log(error.request);
} else {
  // Something happened in setting up the request that triggered an Error
  console.log("Error", error.message);
}
console.log(error.config);
```

You can define a custom HTTP status code error range using the `validateStatus` config option.

## Version

1.5.0

## License

**The MIT License**

Copyright 2018 - Victor Buzzegoli

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contact

[@victorbuzzegoli](https://twitter.com/victorbuzzegoli) on Twitter
