import { simplePromise } from "./simplePromise";

describe("then", () => {
  it("testing", () => {
    return new simplePromise((resolve, reject) => {
      resolve(2);
    }).then((t) => {
      console.log(t);
      // expect(t).toBe()
    });
  });
});
