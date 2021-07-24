export class NotImplementedError extends Error {
  constructor(message) {
    super(!!message ? message : 'Method is not implemented');
  }
}
