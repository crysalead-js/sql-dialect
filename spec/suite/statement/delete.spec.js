import { Dialect } from '../../../src';

describe("Delete", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
    this.delete = this.dialect.statement('delete');
  });

  describe(".from()", function() {

    it("sets the `FROM` clause", function() {

      this.delete.from('table');
      expect(this.delete.toString()).toBe('DELETE FROM "table"');

    });

    it("throws an exception if the `FROM` clause is missing", function() {

      var closure = function() {
        this.delete.toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `DELETE` statement, missing `FROM` clause."));

    });

  });

  describe(".where()", function() {

    it("sets a `WHERE` clause", function() {

      this.delete.from('table').where([true]);
      expect(this.delete.toString()).toBe('DELETE FROM "table" WHERE TRUE');

    });

  });

  describe(".order()", function() {

    it("sets an `ORDER BY` clause", function() {

      this.delete.from('table').order('field');
      expect(this.delete.toString()).toBe('DELETE FROM "table" ORDER BY "field" ASC');

    });

    it("sets an `ORDER BY` clause with a `'DESC'` direction", function() {

      this.delete.from('table').order({ field: 'DESC' });
      expect(this.delete.toString()).toBe('DELETE FROM "table" ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with a `'DESC'` direction (compatibility syntax)", function() {

      this.delete.from('table').order('field DESC');
      expect(this.delete.toString()).toBe('DELETE FROM "table" ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields", function() {

      this.delete.from('table').order([{ field1: 'ASC' }, { field2: 'DESC' }]);
      expect(this.delete.toString()).toBe('DELETE FROM "table" ORDER BY "field1" ASC, "field2" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields using multiple call", function() {

      this.delete
          .from('table')
          .order({ field1: 'ASC' })
          .order({ field2: 'DESC' });

      expect(this.delete.toString()).toBe('DELETE FROM "table" ORDER BY "field1" ASC, "field2" DESC');

    });

    it("ignores empty parameters", function() {

      this.delete
          .from('table')
          .order()
          .order('')
          .order([])
          .order(null);

      expect(this.delete.toString()).toBe('DELETE FROM "table"');

    });

  });

  describe(".limit()", function() {

    it("generates a `LIMIT` statement", function() {

      this.delete.from('table').limit(50);
      expect(this.delete.toString()).toBe('DELETE FROM "table" LIMIT 50');

    });

    it("generates a `LIMIT` statement with a offset value", function() {

      this.delete.from('table').limit(50, 10);
      expect(this.delete.toString()).toBe('DELETE FROM "table" LIMIT 50 OFFSET 10');

    });

    it("doesn't generate an `ORDER BY` with an invalid field names", function() {

      this.delete
          .from('table')
          .limit()
          .limit(0, 0);

      expect(this.delete.toString()).toBe('DELETE FROM "table"');

    });

  });

  describe(".toString()" , function() {

    it("casts object to string query", function() {

      this.delete.from('table');
      var query = 'DELETE FROM "table"';
      expect(this.delete).not.toBe(query);
      expect(String(this.delete)).toBe(query);
      expect(this.delete.toString()).toBe(query);

    });

  });

});