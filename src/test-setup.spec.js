import sinon from 'sinon';

beforeEach(() => {
    this.sandbox = sinon.sandbox.create();
});

afterEach(() => {
    this.sandbox.restore();
})