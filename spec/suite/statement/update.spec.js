var Dialect = require('../../../src/dialect');

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

  describe(".values()", function() {

    it("assures the custom casting handler is correctly called if set", function() {

      var getType = function(field){};

      var caster = function(value, states) {
        expect(states.name).toBe('field');
        expect(states.schema).toBe(getType);
        expect(value).toBe('value');
        return "'casted'";
      };
      this.dialect.caster(caster);
      var update = this.dialect.statement('update', { schema: getType });
      update.table('table').values({ field: 'value' });

      expect(update.toString()).toBe('UPDATE "table" SET "field" = \'casted\'');

    });

    it("assures the custom casting handler is correctly called if set", function() {

      var getType = function(field) {
        if (field === 'field') {
          return 'fieldType';
        }
      };

      var caster = function(value, states) {
        var type = states.schema(states.name);
        return type === 'fieldType' ? "'casted'" : value;
      };

      this.dialect.caster(caster);
      var update = this.dialect.statement('update', { schema: getType });
      update.table('table').values({ field: 'value' }).where({ field: 'value' });

      expect(update.toString()).toBe('UPDATE "table" SET "field" = \'casted\' WHERE "field" = \'casted\'');

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

  describe(".with()", function() {
    it('accepts a single query', function() {
      this.update
        .with({'foo': this.dialect.statement('insert').into('table_a').values({a: 'b'}) })
        .table('table')
        .values({ field: 'value' });
      expect(this.update.toString()).toBe('WITH foo AS (INSERT INTO "table_a" ("a") VALUES (\'b\')) UPDATE "table" SET "field" = \'value\'');
    });
    it('accepts multiple query single query', function() {
      this.update
        .with({
          'foo': this.dialect.statement('insert').into('table_a').values({a: 'b'}),
          'bar': this.dialect.statement('insert').into('table_b').values({a: 'b'})
        })
        .table('table')
        .values({ field: 'value' })
        .where({ '=': [1, 1]});
      expect(this.update.toString()).toBe('WITH foo AS (INSERT INTO "table_a" ("a") VALUES (\'b\')), bar AS (INSERT INTO "table_b" ("a") VALUES (\'b\')) UPDATE "table" SET "field" = \'value\' WHERE 1 = 1');
    });

    it('throws with duplicate names', function() {
      expect(function(){
        this.update
          .with({
            'foo': this.dialect.statement('insert').into('foo').values({a: 'b'})
          })
          .with({
            'foo': this.dialect.statement('insert').into('foo').values({a: 'b'})
          })
          .table('table')
          .values({ field: 'value' });
      }.bind(this)).toThrow(new Error("Common table expression foo specified more than once"));
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
