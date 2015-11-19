import { Dialect } from '../../../src';

describe("Update", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
    this.update = this.dialect.statement('update');
  });

  describe(".table()", function() {

    it("sets the table name", function() {

      this.update
          .table('table')
          .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\'');

    });

    it("throws an exception if the `TABLE` clause is missing", function() {

      var closure = function() {
        this.update
            .values({ field: 'value' })
            .toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `UPDATE` statement, missing `TABLE` clause."));

    });

    it("throws an exception if the `VALUES` clause is missing", function() {

      var closure = function() {
        this.update
            .table('table')
            .toString();
      }.bind(this);
      expect(closure).toThrow(new Error("Invalid `UPDATE` statement, missing `VALUES` clause."));

    });

  });

  describe(".where()", function() {

    it("sets a `WHERE` clause", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .where([true]);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' WHERE TRUE');

    });

  });

  describe(".order()", function() {

    it("sets an `ORDER BY` clause", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .order('field');

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' ORDER BY "field" ASC');

    });

    it("sets an `ORDER BY` clause with a `'DESC'` direction", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .order({ field: 'DESC' });

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with a `'DESC'` direction (compatibility syntax)", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .order('field DESC');

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .order([ { field1: 'ASC' }, { field2: 'DESC' } ]);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' ORDER BY "field1" ASC, "field2" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields using multiple call", function() {

      this.update.table('table')
          .values({ field: 'value' })
          .order({ field1: 'ASC' })
          .order({ field2: 'DESC' });

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' ORDER BY "field1" ASC, "field2" DESC');

    });

    it("ignores empty parameters", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .order()
          .order('')
          .order([])
          .order(null);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\'');

    });

  });

  describe(".limit()", function() {

    it("generates a `LIMIT` statement", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .limit(50);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' LIMIT 50');

    });

    it("generates a `LIMIT` statement with a offset value", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .limit(50, 10);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\' LIMIT 50 OFFSET 10');

    });

    it("doesn't generate an `ORDER BY` with an invalid field names", function() {

      this.update
          .table('table')
          .values({ field: 'value' })
          .limit()
          .limit(0, 0);

      expect(this.update.toString()).toBe('UPDATE "table" SET "field" = \'value\'');

    });

  });

  describe(".toString()" , function() {

    it("casts object to string query", function() {

      this.update.table('table').values({ field: 'value' });;
      var query = 'UPDATE "table" SET "field" = \'value\'';
      expect(this.update).not.toBe(query);
      expect(String(this.update)).toBe(query);
      expect(this.update.toString()).toBe(query);

    });

  });

});