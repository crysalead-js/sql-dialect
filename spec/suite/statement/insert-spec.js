import { Dialect } from '../../../src';

describe("Insert", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
    this.insert = this.dialect.statement('insert');
  });

  describe(".into()", function() {

    it("sets the `INTO` clause", function() {

      this.insert.into('table').values({
        field1: 'value1',
        field2: 'value2'
      });
      expect(this.insert.toString()).toBe('INSERT INTO "table" ("field1", "field2") VALUES (\'value1\', \'value2\')');

    });

    it("throws an exception if the `INTO` clause is missing", function() {

      var closure = function() {
        this.insert
            .values({ field1: 'value1', field2: 'value2' })
            .toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `INSERT` statement, missing `INTO` clause."));

    });

  });

  describe(".toString()" , function() {

    it("casts object to string query", function() {

      this.insert.into('table').values({ field: 'value' });;
      var query = 'INSERT INTO "table" ("field") VALUES (\'value\')';
      expect(this.insert).not.toBe(query);
      expect(String(this.insert)).toBe(query);
      expect(this.insert.toString()).toBe(query);

    });

  });

});