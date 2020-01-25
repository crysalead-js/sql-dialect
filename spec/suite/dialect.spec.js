var extend = require('extend-merge').extend;
var Dialect = require('../../src/dialect');

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

  describe(".quote()", function() {

    it("doesn't escape normal characters", function() {

      expect(this.dialect.quote('abcdef0123456798%-')).toBe('\'abcdef0123456798%-\'');

    });

    it("escapes special characters", function() {

      expect(this.dialect.quote('\0\x08\x09\x1a\n\r"\'')).toBe('\'\\0\\b\\t\\z\\n\\r\\\"\\\'\'');

    });

  });

  describe(".caster()", function() {

    it("gets/sets a caster handler", function() {

      var caster = function() {};
      this.dialect.caster(caster);
      expect(this.dialect.caster()).toBe(caster);

    });

    it("is called when defined to cast values", function() {

      var caster = function() {
        return 'casted';
      };
      this.dialect.caster(caster);
      expect(this.dialect.value('Hello World')).toBe('casted');

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

    it("supports custom aliasing", function() {

      var part = this.dialect.names('some.thing.fieldname', { 'some.thing': 'alias' });
      expect(part).toBe('"alias"."fieldname"');

      part = this.dialect.names({ 'some.thing.fieldname': 'F1' }, { 'some.thing': 'alias' });
      expect(part).toBe('"alias"."fieldname" AS "F1"');

      part = this.dialect.names({
          'some.thing': [
              'field1', { field1: 'F1' }, { 'field1': 'F11' }
          ]
      }, { 'some.thing': 'alias' });
      expect(part).toBe('"alias"."field1", "alias"."field1" AS "F1", "alias"."field1" AS "F11"');

    });

  });

  describe(".value()", function() {

    it("casts values", function() {

      expect(this.dialect.value(null)).toBe('NULL');
      expect(this.dialect.value(true)).toBe('TRUE');
      expect(this.dialect.value(false)).toBe('FALSE');
      expect(this.dialect.value('text')).toBe("'text'");
      expect(this.dialect.value([null, 'text', true])).toBe('\'{NULL,"text",TRUE}\'');
      expect(this.dialect.value(['\\', '"'])).toBe('\'{"\\\\\\\\","\\\\""}\'');
      expect(this.dialect.value(Number(15.85))).toBe('15.85');

    });

    it("assures the custom casting handler is correctly called if set", function() {

      var getType = function(field){};

      var caster = function(value, states) {
        expect(states.name).toBe('field');
        expect(value).toBe('value');
        return 'casted';
      };
      this.dialect.caster(caster);

      expect(this.dialect.value('value', { name: 'field' })).toBe('casted');

    });

  });

  describe(".format()", function() {

    it("format names", function() {

      expect(this.dialect.format(':name', 'fieldname')).toBe('"fieldname"');

      var states = { aliases: {'some.thing': 'alias' } };
      expect(this.dialect.format(':name', 'some.thing.fieldname', states)).toBe('"alias"."fieldname"');

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

    it("generates IS expression", function() {

      var part = this.dialect.conditions({
        ':is': [ {':name': 'score'}, null ]
      });
      expect(part).toBe('"score" IS NULL');

    });

    it("generates a IS expression using the short syntax", function() {

      var part = this.dialect.conditions({
        'score': null
      });
      expect(part).toBe('"score" IS NULL');

    });

    it("generates IS NOT expression", function() {

      var part = this.dialect.conditions({
        ':is not': [ {':name': 'score'}, null ]
      });
      expect(part).toBe('"score" IS NOT NULL');

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

    it("applies parentheses associated to another operator", function() {

      var part = this.dialect.conditions([
        {':or()': [
          {'!=': [
            {':name': 'value' }, 789
          ]},
          {'!=': [
            {':name': 'value' }, 0
          ]}
        ]},
        {':and()': [
          {'<': [
            {':name': 'Table1.min' }, 123
          ]},
          {'>': [
            {':name': 'Table2.max' }, 456
          ]}
        ]}
      ]);
      expect(part).toBe('("value" != 789 OR "value" != 0) AND ("Table1"."min" < 123 AND "Table2"."max" > 456)');

    });

    it("applies casting strategy with correct params", function() {

      var logs = [];

      var defaultSchema = function(value) { return value; };
      var table1Schema = function(value) { return Number.parseInt(value) - 2; };
      var table2Schema = function(value) { return Number.parseInt(value) + 2; };

      var caster = function(value, states) {
        logs.push(extend({}, states));
        var schema = states.schema ? states.schema : function(value) { return value; };
        return schema(value);
      };

      this.dialect.caster(caster);

      var result = this.dialect.conditions([
        {'!=': [
          {':name': 'value' }, 789
        ]},
        {':or': [
          {'<': [
            {':name': 'table1.min' }, 123
          ]},
          {'>': [
            {':name': 'table2.max' }, 456
          ]}
        ]},
        {'!=': [
          {':name': 'value' }, 0
        ]}
      ], {
        schemas: {
          '': defaultSchema,
          'Table1': table1Schema,
          'Table2': table2Schema
        },
        aliases: {
          'table1': 'Table1',
          'table2': 'Table2'
        }
      });
      expect(result).toBe('"value" != 789 AND "Table1"."min" < 121 OR "Table2"."max" > 458 AND "value" != 0');

      expect(logs.length).toBe(4);
      expect(logs[0].schema).toBe(defaultSchema);
      expect(logs[1].schema).toBe(table1Schema);
      expect(logs[2].schema).toBe(table2Schema);
      expect(logs[0].schema).toBe(defaultSchema);

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

    it("supports custom aliasing", function() {

      var part = this.dialect.conditions({
        'some.thing.field1': 'value'
      }, {
        aliases: { 'some.thing': 'alias' }
      });
      expect(part).toBe('"alias"."field1" = \'value\'');

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

      it("builds a condition", function() {

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

  describe(".map/mapped()", function() {

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

    it("preserves passed parameters", function() {

      this.dialect.map('tinyint', 'integer');

      var column = { use: 'tinyint', 'default': 1 }
      expect(this.dialect.mapped(column)).toBe('integer');

      expect(column).toEqual({ use: 'tinyint', 'default': 1 });

    });

    it("returns the default type when options can't match an existing type options", function() {

      this.dialect.map('tinyint', 'boolean', { length: 1 });
      expect(this.dialect.mapped({ use: 'tinyint', length: 3 })).toBe('string');

    });

    it("returns the default type for unexisting types", function() {

      expect(this.dialect.mapped('real')).toBe('string');

    });

  });

});
