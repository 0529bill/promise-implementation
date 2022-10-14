//resources:https://github.com/WebDevSimplified/js-promise-library

/**
new Promise((resolve, reject) => {

}).then((onfullfilled, onrejected) => ... )
 */

const STATE = {
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
  PENDING: "pending",
};

class simplePromise {
  //private fields must be initialized outside of the constructor,
  #thenCallback = [];
  #catchCallback = [];
  #state = STATE.PENDING;
  #value;
  #onSuccessBinded = this.#onSuccess.bind(this);
  #onFailBinded = this.#onFail.bind(this);

  constructor(executionCallback) {
    if (typeof executionCallback !== "function") {
      throw new TypeError("Promise is not a function!");
    }

    try {
      executionCallback(this.#onSuccessBinded, this.#onFailBinded);
    } catch (error) {
      this.#onFail(error);
    }
  }

  #isPromise(value) {
    return Boolean(value && typeof value.then === "function");
  }

  #runCallbacks = () => {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCallback.forEach((callback) => {
        callback(this.#value);
      });
      this.#thenCallback = []; //reset the callback
    }
    if (this.#state === STATE.REJECTED) {
      this.#catchCallback.forEach((callback) => {
        callback(this.#value);
      });
      this.#catchCallback = []; //reset the callback
    }
  };

  #onSuccess(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      //if it's resolving a promise, then pass onSuccess/onFail to it.
      if (this.#isPromise(value)) {
        value.then(this.#onSuccessBinded, this.#onFailBinded);
        return;
      }

      this.#value = value;
      this.#state = STATE.FULFILLED;
      this.#runCallbacks();
    });
  }

  #onFail(value) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (this.#isPromise(value)) {
        value.then(this.#onSuccessBinded, this.#onFailBinded);
        return;
      }

      if (this.#catchCallback.length === 0) {
        throw new UncaughtPromiseError(value);
      }

      this.#value = value;
      this.#state = STATE.REJECTED;
      this.#runCallbacks();
    });
  }

  then(thenCb, catchCb) {
    return new simplePromise((resolve, reject) => {
      this.#thenCallback.push((result) => {
        if (!thenCb) {
          resolve(result);
          return;
        }
        try {
          resolve(thenCb(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#catchCallback.push((result) => {
        if (!catchCb) {
          reject(result);
          return;
        }
        try {
          resolve(catchCb(result));
        } catch (error) {
          reject(error);
        }
      });

      //避免已經resolve了，所以這裡call runCallback
      this.#runCallbacks();
    });

    // return new Promise()
  }

  catch(callback) {
    return this.then(undefined, callback);
  }

  finally(callback) {
    return this.then(
      (result) => {
        callback();
        return result;
      },
      (result) => {
        callback();
        throw result;
      }
    );
  }

  static resolve(value) {
    return new simplePromise((resolve) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new simplePromise((resolve, reject) => {
      reject(value);
    });
  }

  static all(promises) {
    const results = [];
    let completedPromises = 0;
    return new simplePromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise
          .then((value) => {
            completedPromises++;
            results[i] = value;
            if (completedPromises === promises.length) {
              resolve(results);
            }
          })
          .catch(reject);
      }
    });
  }

  static allSettled(promises) {
    const results = [];
    let completedPromises = 0;
    return new simplePromise((resolve) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise
          .then((value) => {
            results[i] = { status: STATE.FULFILLED, value };
          })
          .catch((reason) => {
            results[i] = { status: STATE.REJECTED, reason };
          })
          .finally(() => {
            completedPromises++;
            if (completedPromises === promises.length) {
              resolve(results);
            }
          });
      }
    });
  }

  static race(promises) {
    return new simplePromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve).catch(reject);
      });
    });
  }

  static any(promises) {
    const errors = [];
    let rejectedPromises = 0;
    return new simplePromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise.then(resolve).catch((value) => {
          rejectedPromises++;
          errors[i] = value;
          if (rejectedPromises === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        });
      }
    });
  }
}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error);
    this.stack = `(in Promise) ${error.stack}`;
  }
}

export { simplePromise };

/**
JavaScript class property inside vs outside constructor
https://stackoverflow.com/questions/64436532/javascript-class-property-inside-vs-outside-constructor
 */

/**
all vs allSettled
Promise.all will reject as soon as one of the Promises in the array rejects.
Promise.allSettled will never reject, it will resolve once all Promises in the array have either rejected or resolved.
 */

/**
 class static keyword: Static methods are called directly on the class  - without creating an instance/object.
 Static methods are called directly on the class (Car from the example above) - without creating an instance/object (mycar) of the class.
 */
