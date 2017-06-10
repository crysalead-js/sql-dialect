var PostgreSql = require('../../../../src/dialect/postgre-sql');

describe("PostgreSql Select", function() {

  beforeEach(function() {
    this.dialect = new PostgreSql();
    this.select = this.dialect.statement('select');
  });

  describe(".lock()", function() {

    it("sets the `FOR UPDATE` flag", function() {

      this.select.from('table')
        .lock('update')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR UPDATE');

    });

    it("sets the `FOR SHARE` flag", function() {

      this.select.from('table')
        .lock('share')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR SHARE');

    });

    it("sets the `FOR NO KEY UPDATE` flag", function() {

      this.select.from('table')
        .lock('no key update')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR NO KEY UPDATE');

    });

    it("sets the `FOR KEY SHARE` flag", function() {

      this.select.from('table')
        .lock('key share')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR KEY SHARE');

    });

    it("throws an `SQLException` for invalid lock mode", function() {

      var select = this.select;

      var closure = function() {
        select.from('table')
          .lock('invalid')
          .fields('firstname');
      };
      expect(closure).toThrow(new Error("Invalid PostgreSQL lock mode `'invalid'`."));

    });

  });

  describe(".noWait()", function() {

    it("set the `NOWAIT` flag", function() {

      this.select.from('table')
        .lock('update')
        .noWait()
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR UPDATE NOWAIT');

    });

  });

});
