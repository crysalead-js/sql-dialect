import { Dialect } from '../..';

describe("Dialect", function() {

  beforeEach(function() {
    this.dialect = new Dialect();
  });

  describe(".statement()", function() {

    it("creates a statement instance", function() {

      var select = this.dialect.statement('select');
      expect(select.dialect()).toBe(this.dialect);

    });

    it("throws an exception for undefined statement", function() {

      var closure = function() {
        this.dialect.statement('undefined');
      }.bind(this);
      expect(closure).toThrow(new Error("Unsupported statement `'undefined'`."));

    });

  });

  describe(".quoter()", function() {

    it("gets/sets a quote handler", function() {

      var quoter = function() {};
      this.dialect.quoter(quoter);
      expect(this.dialect.quoter()).toBe(quoter);

    });

    it("overrides the quote behavior", function() {

      var quoter = function(string) { return '@' + string + '@'; };
      this.dialect.quoter(quoter);
      expect(this.dialect.quote('hello')).toBe('@hello@');

    });

  });

  describe(".caster()", function() {

    it("gets/sets a caster handler", function() {

      var caster = function() {};
      this.dialect.caster(caster);
      expect(this.dialect.caster()).toBe(caster);

    });

  });

  describe(".names()", function() {

    it("escapes table name with a schema prefix", function() {

      var part = this.dialect.names('schema.tablename');
      expect(part).toBe('"schema"."tablename"');

    });

    it("escapes field name with a table prefix", function() {

      var part = this.dialect.names('tablename.fieldname');
      expect(part).toBe('"tablename"."fieldname"');

    });

    it("escapes aliased fields with a table prefix name using an array syntax", function() {

      var part = this.dialect.names({ 'tablename.fieldname': 'F1' });
      expect(part).toBe('"tablename"."fieldname" AS "F1"');

    });

    it("escapes aliased fields name with a table prefix using an array syntax", function() {

      var fields = [
        { 'name1' : [ {'field1': 'F1' }, { 'field2': 'F2' }] },
        { 'name2' : [ {'field3': 'F3' }, { 'field4': 'F4' }] }
      ];
      var part = this.dialect.names(fields);
      expect(part).toBe([
        '"name1"."field1" AS "F1"',
        '"name1"."field2" AS "F2"',
        '"name2"."field3" AS "F3"',
        '"name2"."field4" AS "F4"'
      ].join(', '));

    });

    it("handle mixed syntax", function() {

      var fields = [
        'prefix.field1',
        { 'prefix.field1': 'F1' },
        { 'prefix': ['field2', { 'field3': 'F3' }, [{ 'field3': 'F33' }]] }
      ];
      var part = this.dialect.names(fields);
      expect(part).toBe([
        '"prefix"."field1"',
        '"prefix"."field1" AS "F1"',
        '"prefix"."field2"',
        '"prefix"."field3" AS "F3"',
        '"prefix"."field3" AS "F33"'
      ].join(', '));

    });

    it("casts objects as string", function() {

      this.select = this.dialect.statement('select');
      this.select.from('table2').alias('t2');

      var part = this.dialect.names([this.select, { 'name2': [{ 'field2': 'F2' }] }]);
      expect(part).toBe([
        '(SELECT * FROM "table2") AS "t2"',
        '"name2"."field2" AS "F2"'
      ].join(', '));

    });

    it("supports operators", function() {

      var part = this.dialect.names({
        ':count()': [{
          ':distinct': [{
            ':name': 'table.firstname'
          }]
        }]
      });
      expect(part).toBe('COUNT(DISTINCT "table"."firstname")');

    });

    it("supports formatter operators", function() {

      var part = this.dialect.names({ ':plain': 'COUNT(*)' });
      expect(part).toBe("COUNT(*)");

    });

    it("ignores duplicates", function() {

      var fields = [
        'prefix.field1',
        'prefix.field1',
        'prefix.field2',
        'prefix.field2',
        { 'prefix': [
          'field1', 'field2', 'field1', 'field2',
          { 'field3': 'F3' },
          { 'field4': 'F4' },
          { 'field3': 'F5' },
          { 'field4': 'F6' }
        ] }
      ];
      var part = this.dialect.names(fields);
      expect(part).toBe([
        '"prefix"."field1"',
        '"prefix"."field2"',
        '"prefix"."field3" AS "F3"',
        '"prefix"."field4" AS "F4"',
        '"prefix"."field3" AS "F5"',
        '"prefix"."field4" AS "F6"'
      ].join(', '));

    });

    it("supports nested arrays", function() {

      var part = this.dialect.names([[[[[{ 'tablename.fieldname': 'F1' }]]]]]);
      expect(part).toBe('"tablename"."fieldname" AS "F1"');

    });

    it("nested arrays keeps prefix", function() {

      var fields = { 'prefix': [
        'field1', { 'field1': 'F1' }, { 'field1': 'F11' }
      ] };
      var part = this.dialect.names(fields);
      expect(part).toBe([
        '"prefix"."field1"',
        '"prefix"."field1" AS "F1"',
        '"prefix"."field1" AS "F11"',
      ].join(', '));

    });

    context("with field query mode (i.e. not escaping star)", function() {

      it("doesn't escapes star", function() {

        var fields = ['prefix.*'];
        var part = this.dialect.names(fields);
        expect(part).toBe('"prefix".*');

      });

      it("doesn't escapes star using an array syntax", function() {

        var fields = { 'prefix': ['*'] };
        var part = this.dialect.names(fields);
        expect(part).toBe('"prefix".*');

      });

    });

  });

  describe(".format()", function() {

    it("format names", function() {

      expect(this.dialect.format(':name', 'fieldname')).toBe('"fieldname"');

    });

    it("format values", function() {

      expect(this.dialect.format(':value', 'value')).toBe("'value'");

    });

    it("doesn't format plain", function() {

      expect(this.dialect.format(':plain', 'plain')).toBe('plain');

    });

    it("throws an exception for undefined formatters", function() {

      var closure = function() {
        this.dialect.format(':undefined', 'value');
      }.bind(this);
      expect(closure).toThrow(new Error("Unexisting formatter `':undefined'`."));

    });

  });

  describe(".conditions()", function() {

    it("generates a equal expression", function() {

      var part = this.dialect.conditions([
        {'field1': 'value'},
        {'field2': 10}
      ]);
      expect(part).toBe('"field1" = \'value\' AND "field2" = 10');

    });

    it("generates a simple field equality", function() {

      var part = this.dialect.conditions([
        {'field1': {':name': 'field2'}}
      ]);
      expect(part).toBe('"field1" = "field2"');

    });

    it("generates a equal expression between fields", function() {

      var part = this.dialect.conditions([
        {'=': [
          {':name': 'field1'},
          {':name': 'field2'}
        ]},
        {'=': [
          {':name': 'field3'},
          {':name': 'field4'}
        ]}
      ]);
      expect(part).toBe('"field1" = "field2" AND "field3" = "field4"');

    });

    it("generates a comparison expression", function() {

      var part = this.dialect.conditions([
        {'>' : [ {':name': 'field'}, 10 ]},
        {'<=': [ {':name': 'field'}, 15 ]}
      ]);
      expect(part).toBe('"field" > 10 AND "field" <= 15');

    });

    it("generates a BETWEEN/NOT BETWEEN expression", function() {

      var part = this.dialect.conditions({
        ':between': [ {':name': 'score'}, [90, 100] ]
      });
      expect(part).toBe('"score" BETWEEN 90 AND 100');

      part = this.dialect.conditions({
        ':not between': [ {':name': 'score'}, [90, 100] ]
      });
      expect(part).toBe('"score" NOT BETWEEN 90 AND 100');

    });

    it("generates a IN expression using the short syntax", function() {

      var part = this.dialect.conditions({
        'score': [1, 2, 3, 4, 5]
      });
      expect(part).toBe('"score" IN (1, 2, 3, 4, 5)');

    });

    it("generates a IN expression", function() {

      var part = this.dialect.conditions({
        ':in': [ {':name': 'score'}, [1, 2, 3, 4, 5]]
      });
      expect(part).toBe('"score" IN (1, 2, 3, 4, 5)');

    });

    it("generates a NOT IN expression", function() {

      var part = this.dialect.conditions({
        ':not in': [ {':name': 'score'}, [1, 2, 3, 4, 5]]
      });
      expect(part).toBe('"score" NOT IN (1, 2, 3, 4, 5)');

    });

    it("generates a subquery ANY expression", function() {

      var part = this.dialect.conditions({
        ':any': [
          {':name': 'score'},
          {':plain': 'SELECT "s1" FROM "t1"'}
        ]
      });
      expect(part).toBe('"score" ANY (SELECT "s1" FROM "t1")');

    });

    it("generates a subquery ANY expression with a subquery instance", function() {

      var subquery = this.dialect.statement('select');
      subquery.fields('s1').from('t1');

      var part = this.dialect.conditions({
        ':any': [
          {':name': 'score'},
          {':plain': subquery}
        ]
      });
      expect(part).toBe('"score" ANY (SELECT "s1" FROM "t1")');

    });

    it("manages functions", function() {

      var part = this.dialect.conditions({
        ':concat()': [
          {':name': 'table.firstname'},
          {':value': ' '},
          {':name': 'table.lastname'}
        ]
      });
      expect(part).toBe('CONCAT("table"."firstname", \' \', "table"."lastname")');

    });

    it("parses the parentheses operator", function() {

      var part = this.dialect.conditions({'*': [ {'()': [ {'+': [1, 2]} ]}, 3 ]});
      expect(part).toBe('(1 + 2) * 3');

      part = this.dialect.conditions({'()': [1, 2]});
      expect(part).toBe('(1, 2)');

    });

    context("with the alternative syntax", function() {

      it("generates a BETWEEN/NOT BETWEEN expression", function() {
        var part = this.dialect.conditions({
          'score': {':between': [90, 100]}
        });
        expect(part).toBe('"score" BETWEEN 90 AND 100');
      });

    });

    it("throws an exception for undefined operators", function() {

      var closure = function() {
        this.dialect.conditions({':undefined': ['one', 'two']});
      }.bind(this);
      expect(closure).toThrow(new Error("Unexisting operator `':undefined'`."));

    });

  });

  describe(".prefix()", function() {

    it("prefixes field names", function() {

      var part = this.dialect.prefix([
        'field1',
        'field2',
        'prefix.field3'
      ], 'prefix');

      expect(part).toEqual([
        'prefix.field1',
        'prefix.field2',
        'prefix.field3'
      ]);

    });

    context("with conditions", function() {

      it("prefixes field names", function() {

        var part = this.dialect.conditions(this.dialect.prefix([
          'value1',
          'value2'
        ], 'prefix', false));
        expect(part).toBe("'value1' AND 'value2'");

      });

      it("prefixes field names", function() {

        var part = this.dialect.conditions(this.dialect.prefix([
          {'field1': 'value'},
          {'field2': 10}
        ], 'prefix', false));
        expect(part).toBe('"prefix"."field1" = \'value\' AND "prefix"."field2" = 10');

      });

      it("doesn't prefixes values", function() {

        var part = this.dialect.conditions(this.dialect.prefix([
          {'field1': [1, 2, 3]}
        ], 'prefix', false));
        expect(part).toBe('"prefix"."field1" IN (1, 2, 3)');

      });

      it("prefixes nested field names", function() {

        var part = this.dialect.conditions(this.dialect.prefix([
          {'=': [
            {':name': 'field1'},
            {':name': 'field2'}
          ]},
          {'=': [
            {':name': 'field3'},
            {':name': 'field4'}
          ]}
        ], 'prefix'));
        expect(part).toBe('"prefix"."field1" = "prefix"."field2" AND "prefix"."field3" = "prefix"."field4"');

      });

    });

  });

  describe(".meta()", function() {

    it("returns an empty string for undefined meta", function() {

      expect(this.dialect.meta('table', {'tablespace': 'myspace'})).toBe('');

    });

  });

  describe(".field()", function() {

    it("throws an exception if `'name'` is undefined", function() {

      var closure = function() {
        this.dialect.field([]);
      }.bind(this);
      expect(closure).toThrow(new Error("Missing column name."));

    });

  });

  describe(".map()", function() {

    it("gets/sets type matching", function() {

      this.dialect.map('real', 'float');
      expect(this.dialect.mapped('real')).toBe('float');

    });

    it("gets/sets type matching with options and column data", function() {

      this.dialect.map('tinyint', 'boolean', { length: 1 });
      this.dialect.map('tinyint', 'integer');

      expect(this.dialect.mapped({
        use: 'tinyint',
        'default': 1
      })).toBe('integer');

      expect(this.dialect.mapped({
        use: 'tinyint',
        length: 1,
        'default': true
      })).toBe('boolean');

    });

    it("throws an exception when options can't many any type", function() {

      this.dialect.map('tinyint', 'boolean', { length: 1 });

      var closure = function() {
        this.dialect.mapped({ use: 'tinyint', length: 3 });
      }.bind(this);
      expect(closure).toThrow(new Error("No type matching has been defined for `'tinyint'`."));

    });

  });

  describe(".mapped()", function() {

    it("throws an exception if there's no type matching defined", function() {

      var closure = function() {
        this.dialect.mapped('real');
      }.bind(this);
      expect(closure).toThrow(new Error("No type matching has been defined for `'real'`."));

    });

  });

});
