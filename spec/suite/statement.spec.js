import { Statement } from '../../src';

describe("Statement", function() {

  beforeEach(function() {
    this.statement = new Statement();
  });

  describe(".dialect()", function() {

    it("gets/sets a dialect", function() {

      var dialect = {};
      this.statement.dialect(dialect);
      expect(this.statement.dialect()).toBe(dialect);

    });

    it("throws an exception if no dialect has been defined", function() {

      var closure = function() {
        this.statement.dialect();
      }.bind(this);
      expect(closure).toThrow(new Error("Missing SQL dialect adapter."));

    });

  });

  describe(".data()", function() {

    it("gets/sets some data", function() {

      this.statement.data('key', 'value');
      expect(this.statement.data('key')).toBe('value');

    });

  });

  describe(".setFlag()/.getFlag()", function() {

    it("gets/sets some flag", function() {

      expect(this.statement.setFlag('flag')).toBe(true);
      expect(this.statement.getFlag('flag')).toBe(true);
      expect(this.statement.setFlag('flag', false)).toBe(false);
      expect(this.statement.getFlag('flag')).toBe(false);

    });

  });

});