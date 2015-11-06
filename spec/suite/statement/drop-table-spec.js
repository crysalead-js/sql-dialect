import { Dialect } from '../../..';

describe("DropTable", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
    this.drop = this.dialect.statement('drop table');
  });

  describe(".table()", function() {

    it("sets the `TABLE` clause", function() {

      this.drop.table('table1');

      var expected = 'DROP TABLE "table1"';
      expect(this.drop.toString()).toBe(expected);

    });

    it("throws an exception if the `TABLE` clause is missing", function() {

      var closure = function() {
        this.drop.toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `DROP TABLE` statement, missing `TABLE` clause."));

    });

  });

  describe(".ifExists()", function() {

    it("sets the `IF EXISTS` flag", function() {

      this.drop.table('table1')
          .ifExists();

      var expected = 'DROP TABLE IF EXISTS "table1"';
      expect(this.drop.toString()).toBe(expected);

    });

  });

  describe(".cascade()", function() {

    it("sets the `CASCADE` flag", function() {

      this.drop
          .table('table1')
          .cascade();

      var expected = 'DROP TABLE "table1" CASCADE';
      expect(this.drop.toString()).toBe(expected);

    });

  });

  describe(".restrict()", function() {

    it("sets the `RESTRICT` flag", function() {

      this.drop
          .table('table1')
          .restrict();

      var expected = 'DROP TABLE "table1" RESTRICT';
      expect(this.drop.toString()).toBe(expected);

    });

  });

});
