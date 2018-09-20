var Sqlite = require('../../../../src/dialect/sqlite');

describe("Sqlite Truncate", function() {

  beforeEach(function() {
    this.dialect = new Sqlite();
    this.truncate = this.dialect.statement('truncate');
  });

  describe(".table()", function() {

    it("sets the `TABLE` clause", function() {

      this.truncate.table('table');
      expect(this.truncate.toString()).toBe('DELETE FROM "table";DELETE FROM "SQLITE_SEQUENCE" WHERE name="table"');

    });

    it("throws an exception if the `TABLE` clause is missing", function() {

      var closure = function() {
        this.truncate.toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `TRUNCATE` statement, missing `TABLE` clause."));

    });

  });

});
