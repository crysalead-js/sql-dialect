var Dialect = require('../../../src/dialect');

describe("Select", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
    this.select = this.dialect.statement('select');
  });

  describe(".distinct()", function() {

    it("sets the `DISTINCT` flag", function() {

      this.select.from('table')
          .distinct()
          .fields('firstname');
      expect(this.select.toString()).toBe('SELECT DISTINCT "firstname" FROM "table"');

    });

  });

  describe(".forUpdate()", function() {

    it("sets the `FOR UPDATE` flag", function() {

      this.select.from('table')
          .forUpdate()
          .fields('firstname');
      expect(this.select.toString()).toBe('SELECT "firstname" FROM "table" FOR UPDATE');

    });

  });

  describe(".fields()", function() {

    it("sets the fields", function() {

      this.select.from('table')
          .fields('firstname', 'lastname');
      expect(this.select.toString()).toBe('SELECT "firstname", "lastname" FROM "table"');

    });

    it("sets the fields", function() {

      this.select.from('table')
          .fields({ 'firstname': 'FN' }, { 'lastname': 'LN' });
      expect(this.select.toString()).toBe('SELECT "firstname" AS "FN", "lastname" AS "LN" FROM "table"');

    });

    it("sets the fields using an array syntax", function() {

      this.select.from('table')
          .fields(['firstname', 'lastname']);
      expect(this.select.toString()).toBe('SELECT "firstname", "lastname" FROM "table"');

    });

  });

  describe(".from()", function() {

    it("throws an exception if the table source is empty", function() {

      var closure = function() {
        this.select.from('');
      }.bind(this);
      expect(closure).toThrow(new Error("A `FROM` clause requires a non empty table."));

    });

    it("sets the `FROM` clause", function() {

      this.select.from('table');
      expect(this.select.toString()).toBe('SELECT * FROM "table"');

    });

    it("sets multiple `FROM`", function() {

      this.select.from('table', 'table2');
      expect(this.select.toString()).toBe('SELECT * FROM "table", "table2"');

    });

    it("sets multiple `FROM` using an array syntax", function() {

      this.select.from(['table', 'table2']);
      expect(this.select.toString()).toBe('SELECT * FROM "table", "table2"');

    });

    it("sets multiple `FROM` with multiple call", function() {

      this.select.from('table').from('table2');
      expect(this.select.toString()).toBe('SELECT * FROM "table", "table2"');

    });

    it("sets the `FROM` clause with aliases table name", function() {

      this.select.from([{ 'table': 'T1' }, { 'table2': 'T2' }]);
      expect(this.select.toString()).toBe('SELECT * FROM "table" AS "T1", "table2" AS "T2"');

    });

  });

  describe(".join()", function() {

    it("sets a `LEFT JOIN` clause", function() {

      this.select.from('table').join('table2');
      expect(this.select.toString()).toBe('SELECT * FROM "table" LEFT JOIN "table2"');

    });

    it("sets a `LEFT JOIN` clause with an alias", function() {

      this.select.from('table').join({'table2': 't2'});
      expect(this.select.toString()).toBe('SELECT * FROM "table" LEFT JOIN "table2" AS "t2"');

    });

    it("sets a `RIGHT JOIN` clause with an alias", function() {

      this.select.from('table').join({'table2': 't2'}, [], 'right');
      expect(this.select.toString()).toBe('SELECT * FROM "table" RIGHT JOIN "table2" AS "t2"');

    });

    it("sets a `LEFT JOIN` clause using a subquery instance", function() {

      var subquery = this.dialect.statement('select').from('table2').alias('t2');

      this.select.from('table').join(subquery);
      expect(this.select.toString()).toBe('SELECT * FROM "table" LEFT JOIN (SELECT * FROM "table2") AS "t2"');

    });


    it("sets a `LEFT JOIN` clause using a subquery instance (the long way)", function() {

      var subquery = this.dialect.statement('select').from('table2');

      this.select.from('table').join({':as': [subquery, { ':name': 't2' }] });
      expect(this.select.toString()).toBe('SELECT * FROM "table" LEFT JOIN (SELECT * FROM "table2") AS "t2"');

    });

    it("sets a `LEFT JOIN` clause with an `ON` statement", function() {

      var on = { '=': [
        {':name': 't.table2_id' },
        {':name': 't2.id' }
      ] };
      this.select.from({ 'table': 't' }).join({ 'table2': 't2' }, on);
      expect(this.select.toString()).toBe('SELECT * FROM "table" AS "t" LEFT JOIN "table2" AS "t2" ON "t"."table2_id" = "t2"."id"');

    });

    it("ignores empty parameters", function() {

      this.select.from('table')
          .join()
          .join(null);

      expect(this.select.toString()).toBe('SELECT * FROM "table"');

    });

  });

  describe(".where()", function() {

    it("sets a `WHERE` clause", function() {

      this.select.from('table').where([true]);
      expect(this.select.toString()).toBe('SELECT * FROM "table" WHERE TRUE');

    });

  });

  describe(".group()", function() {

    it("sets a `GROUP BY` clause", function() {

      this.select.from('table').group('field');
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field"');

    });

    it("sets a `GROUP BY` clause with multiple fields", function() {

      this.select.from('table').group('field1', 'field2');
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field1", "field2"');

    });

    it("sets a `GROUP BY` clause with multiple fields using an array", function() {

      this.select.from('table').group(['field1', 'field2']);
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field1", "field2"');

    });

    it("sets a `GROUP BY` clause with multiple fields with multiple calls", function() {

      this.select.from('table')
          .group('field1')
          .group('field2');

      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field1", "field2"');

    });

    it("ignores empty parameters", function() {

      this.select
          .from('table')
          .group('')
          .group([])
          .group(null);

      expect(this.select.toString()).toBe('SELECT * FROM "table"');

    });

  });

  describe(".having()", function() {

    it("sets a `HAVING` clause", function() {

      this.select.from('table').group('field').having([true]);
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field" HAVING TRUE');

    });

    it("sets a `HAVING` with multiple fields", function() {

      this.select.from('table').group('field').having(true, true);
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field" HAVING TRUE AND TRUE');

    });

    it("sets a `HAVING` with multiple fields using array based conditions", function() {

      this.select.from('table').group('field').having([true], [true]);
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field" HAVING TRUE AND TRUE');

    });

    it("sets a `HAVING` with multiple fields using an array", function() {

      this.select.from('table').group('field').having([true, true]);
      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field" HAVING TRUE AND TRUE');

    });

    it("sets a `HAVING` with multiple fields with multiple calls", function() {

      this.select.from('table')
          .group('field')
          .having(true)
          .having(true);

      expect(this.select.toString()).toBe('SELECT * FROM "table" GROUP BY "field" HAVING TRUE AND TRUE');

    });

  });

  describe(".order()", function() {

    it("sets an `ORDER BY` clause", function() {

      this.select.from('table').order('field');
      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field" ASC');

    });

    it("sets an `ORDER BY` clause with a `'DESC'` direction", function() {

      this.select.from('table').order({ 'field': 'DESC' });
      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with a `'DESC'` direction (compatibility syntax)", function() {

      this.select.from('table').order('field DESC');
      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields", function() {

      this.select.from('table').order({ 'field1': 'ASC' } , { 'field2': 'DESC' });
      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field1" ASC, "field2" DESC');

    });

    it("sets an a `ORDER BY` clause with multiple fields using multiple call", function() {

      this.select.from('table')
          .order({ 'field1': 'ASC' })
          .order({ 'field2': 'DESC' });

      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field1" ASC, "field2" DESC');

    });

    it("uses `ASC` ordering by default", function() {

      this.select.from('table').order(['field1']);

      expect(this.select.toString()).toBe('SELECT * FROM "table" ORDER BY "field1" ASC');

    });

    it("ignores empty parameters", function() {

      this.select
          .from('table')
          .order('')
          .order([])
          .order(null);

      expect(this.select.toString()).toBe('SELECT * FROM "table"');

    });

  });

  describe(".limit()", function() {

    it("generates a `LIMIT` statement", function() {

      this.select.from('table').limit(50);
      expect(this.select.toString()).toBe('SELECT * FROM "table" LIMIT 50');

    });

    it("generates a `LIMIT` statement with a offset value", function() {

      this.select.from('table').limit(50, 10);
      expect(this.select.toString()).toBe('SELECT * FROM "table" LIMIT 50 OFFSET 10');

    });

    it("doesn't generate an `ORDER BY` with an invalid field names", function() {

      this.select
          .from('table')
          .limit()
          .limit(0, 0);

      expect(this.select.toString()).toBe('SELECT * FROM "table"');

    });

  });

  describe(".alias()", function() {

    it("sets the alias", function() {

      this.select.from('table2').alias('t2');
      expect(this.select.toString()).toBe('(SELECT * FROM "table2") AS "t2"');

    });

    it("returns the alias", function() {

      this.select.from('table2').alias('t2');
      expect(this.select.alias()).toBe('t2');

    });

    it("clears the alias", function() {

      this.select.from('table2').alias('t2');
      expect(this.select.toString()).toBe('(SELECT * FROM "table2") AS "t2"');

      this.select.alias(null);
      expect(this.select.toString()).toBe('SELECT * FROM "table2"');

    });

  });

  describe(".toString()" , function() {

    it("casts object to string query", function() {

      this.select.from('table');
      var query = 'SELECT * FROM "table"';
      expect(this.select).not.toBe(query);
      expect(String(this.select)).toBe(query);
      expect(this.select.toString()).toBe(query);

    });

  });

});
