import { simplePromise } from "./simplePromise";

describe("basic testing", () => {
  it("single then", () => {
    return new simplePromise((resolve, reject) => {
      resolve(2);
    }).then((v) => {
      expect(v).toEqual(2);
    });
  });

  it("single catch ", () => {
    expect.assertions(1);
    return new simplePromise((resolve, reject) => {
      reject("error");
    }).catch((v) => {
      expect(v).toEqual("error");
    });
  });

  it("multiple then for the same promise", () => {
    const promise = () =>
      new simplePromise((resolve, reject) => {
        resolve(2);
      });
    const promise1 = promise().then((t) => expect(t).toEqual(2));
    const promise2 = promise().then((t) => expect(t).toEqual(2));
  });

  it("then and catch", () => {
    expect.assertions(1);
    return new simplePromise((resolve, reject) => reject("error"))
      .then((v) => "Wrong")
      .catch((v) => expect(v).toEqual("error"));
  });

  it("multiple then and catch", () => {
    const num = new simplePromise((resolve, reject) => {
      resolve(10);
    })
      .then((num) => num * 10)
      .catch((error) => error)
      .then((num) => num - 1)
      .then((num) => expect(num).toEqual(99));
  });
});

describe("finally", () => {
  it("resolve finally", () => {
    return new simplePromise((resolve, reject) => {
      resolve(2);
    }).finally((t) => expect(t).toBeUndefined());
  });

  it("reject finally", () => {
    return new simplePromise((resolve, reject) => {
      reject(2);
    })
      .finally((t) => console.log("t", t))
      .catch((error) => error);
  });

  it("finally chaining", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      resolve(2);
    })
      .then((t) => t)
      .finally((t) => expect(t).toBeUndefined());
    const promise2 = new simplePromise((resolve, reject) => {
      reject(2);
    })
      .catch((t) => t)
      .finally((t) => expect(t).toBeUndefined());
  });
});

describe("methods", () => {
  it("all - success", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      resolve(1);
    });
    const promise2 = new simplePromise((resolve, reject) => {
      resolve(2);
    });

    return simplePromise
      .all([promise1, promise2])
      .then((t) => expect(t).toEqual([1, 2]));
  });

  it("all - fail", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      resolve(1);
    });
    const promise2 = new simplePromise((resolve, reject) => {
      reject(2);
    });

    return simplePromise
      .all([promise1, promise2])
      .catch((t) => expect(t).toEqual(2));
  });

  it("allSettled", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      resolve(1);
    });
    const promise2 = new simplePromise((resolve, reject) => {
      reject(2);
    });

    return simplePromise
      .allSettled([promise1, promise2])
      .catch((t) => expect(t).toEqual([1, 2]));
  });

  it("race", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    });
    const promise2 = new simplePromise((resolve, reject) => {
      resolve(2);
    });

    return simplePromise
      .race([promise1, promise2])
      .then((t) => expect(t).toEqual(2));
  });

  it("any", () => {
    const promise1 = new simplePromise((resolve, reject) => {
      resolve(1);
    });
    const promise2 = new simplePromise((resolve, reject) => {
      resolve(2);
    });

    const promiseFail1 = new simplePromise((resolve, reject) => {
      resolve(1);
    });
    const promiseFail2 = new simplePromise((resolve, reject) => {
      resolve(2);
    });

    simplePromise.any([promise1, promise2]).then((t) => expect(t).toEqual(1));
    simplePromise
      .any([promiseFail1, promiseFail2])
      .catch((t) => expect(t).toEqual([1, 2]));
  });
});

//testing asynchronous code => https://jestjs.io/docs/asynchronous
// expect.assertion => https://stackoverflow.com/questions/50816254/necessary-to-use-expect-assertions-if-youre-awaiting-any-async-function-calls
