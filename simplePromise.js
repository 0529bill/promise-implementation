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
  //private fields ( very new syntax) must be initialized outside of the constructor,
  #thenCallback = [];
  #catchCallback = [];
  #state = STATE.PENDING;
  #value;
  #onSuccessBinded = this.#onSuccess.bind(this);
  #onFailBinded = this.#onFail.bind(this);

  constructor(executionCallback) {
    try {
      executionCallback(this.#onSuccessBinded, this.#onFailBinded);
    } catch (error) {
      this.onFail(error);
    }
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
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.FULFILLED;
    this.#runCallbacks();
  }

  #onFail(value) {
    if (this.#state !== STATE.PENDING) return;
    this.#value = value;
    this.#state = STATE.REJECTED;
    this.#runCallbacks();
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

      //   if (thenCallback) {
      //     this.#thenCallback.push(thenCallback);
      //   }
      //   if (catchCallback) {
      //     this.#catchCallback.push(catchCallback);
      //   }

      this.#runCallbacks();
    });

    // return new Promise()
  }

  catch(callback) {
    this.then(undefined, callback);
  }

  finally(cb) {}
}

export { simplePromise };

/**
JavaScript class property inside vs outside constructor
https://stackoverflow.com/questions/64436532/javascript-class-property-inside-vs-outside-constructor
 */
