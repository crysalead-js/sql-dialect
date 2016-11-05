var Sqlite = require('../../../../src/dialect/sqlite');

describe("Sqlite CreateTable", function() {

  beforeEach(function() {
    this.dialect = new Sqlite();
    this.create = this.dialect.statement('create table');
  });

  describe(".ifNotExists()", function() {

    it("sets the `IF NOT EXISTS` flag", function() {

      this.create.table('table1')
          .ifNotExists(false)
          .columns({
            id: { type: 'serial' }
          });

      var expected = 'CREATE TABLE "table1" ("id" integer NOT NULL, PRIMARY KEY ("id"))';
      expect(this.create.toString()).toBe(expected);

    });

  });

  describe(".columns()", function() {

    it("sets a primary key", function() {

      this.create.table('table1')
          .columns({
            id: { type: 'serial' }
          });

      var expected = 'CREATE TABLE "table1" ("id" integer NOT NULL, PRIMARY KEY ("id"))';
      expect(this.create.toString()).toBe(expected);

    });

    it("sets specific columns meta", function() {

      this.create.table('table1')
          .columns([
            { population: { type: 'integer' } },
            { city: { type: 'string', length: 255, null: false } }
          ]);

      var expected = 'CREATE TABLE "table1" ("population" integer, "city" varchar(255) NOT NULL)';
      expect(this.create.toString()).toBe(expected);

    });

  });

  describe(".constraint()", function() {

    it("sets a primary key constraint", function() {

      this.create.table('table1')
          .columns({
            email: { type: 'string' }
          })
          .constraint({ type: 'primary', column: 'email' });

      var expected = 'CREATE TABLE "table1" ("email" varchar(255), PRIMARY KEY ("email"))';
      expect(this.create.toString()).toBe(expected);

    });

    it("sets a mulit key primary key constraint", function() {

      this.create.table('table1')
          .columns([
            { firstname: { type: 'string' } },
            { lastname: { type: 'string' } }
          ])
          .constraint({ type: 'primary', column: ['firstname', 'lastname'] });

      var expected = 'CREATE TABLE "table1" ("firstname" varchar(255), "lastname" varchar(255), PRIMARY KEY ("firstname", "lastname"))';
      expect(this.create.toString()).toBe(expected);

    });

    it("sets a `CHECK` constraint", function() {

      this.create.table('table1')
          .columns([
            { population: { type: 'integer' } },
            { name: { type: 'string', length: 255 } }
          ])
          .constraint({
            type: 'check',
            expr: [
              { population: { '>': 20 } },
              { name: 'Los Angeles' }
            ]
          });

      var expected = 'CREATE TABLE "table1" ("population" integer, "name" varchar(255),';
      expected += ' CHECK ("population" > 20 AND "name" = \'Los Angeles\'))';
      expect(this.create.toString()).toBe(expected);

    });

    context("with a casting handler defined", function() {

      beforeEach(function() {

        var dialect = this.dialect;

        function gettype(value) {
          if (typeof value === 'object') {
            if (value === null) {
              return 'null';
            }
            if (Array.isArray(value)) {
              return 'array';
            }
            return 'object';
          }
          if (typeof value === 'string') {
            return 'string';
          }
          if (typeof value === 'boolean') {
            return 'boolean';
          }
          if (typeof value === 'number') {
            return value % 1 === 0 ? 'integer' : 'float';
          }
        }

        dialect.caster(function(value, states) {
          var type = states && states.type ? states.type : gettype(value);
          if (typeof type === 'function') {
            type = type(states.name);
          }
          switch (type) {
            case 'integer':
              return Number.parseInt(value);
            break;
            default:
              return String(dialect.quote(value));
            break;
          }
        });

      });

      it("sets a `CHECK` constraint", function() {

        this.create.table('table1')
            .columns([
              { population: { type: 'integer' } },
              { name: { type: 'string', length: 255 } }
            ])
            .constraint({
              type: 'check',
              expr: [
                { population: { '>': '20' } },
                { name: 'Los Angeles' }
              ]
            });

        var expected = 'CREATE TABLE "table1" ("population" integer, "name" varchar(255),';
        expected += ' CHECK ("population" > 20 AND "name" = \'Los Angeles\'))';
        expect(this.create.toString()).toBe(expected);

      });

      it("sets a named `CHECK` constraint", function() {

        this.create.table('table1')
            .columns([
              { population: { type: 'integer' } }
            ])
            .constraint({
              type: 'check',
              constraint: 'pop',
              expr: [
                { population: { '>': '20' } },
              ]
            });

        var expected = 'CREATE TABLE "table1" ("population" integer, CONSTRAINT "pop" CHECK ("population" > 20))';
        expect(this.create.toString()).toBe(expected);

      });

    });

    it("sets a `UNIQUE` constraint", function() {

      this.create.table('table1')
          .columns([
            { email: { type: 'string' } }
          ])
          .constraint({ type: 'unique', column: 'email' });

      var expected  = 'CREATE TABLE "table1" ("email" varchar(255), UNIQUE ("email"))';
      expect(this.create.toString()).toBe(expected);

    });

    it("sets a multi key `UNIQUE` constraint", function() {

      this.create.table('table1')
          .columns([
            { firstname: { type: 'string' } },
            { lastname: { type: 'string' } }
          ])
          .constraint({ type: 'unique', column: ['firstname', 'lastname'] });

      var expected  = 'CREATE TABLE "table1" ("firstname" varchar(255), "lastname" varchar(255), UNIQUE ("firstname", "lastname"))';
      expect(this.create.toString()).toBe(expected);

    });

    it("sets a `FOREIGN KEY` constraint", function() {

      this.create.table('table1')
          .columns([
            { id: { type: 'id'} },
            { user_id: { type: 'integer' } }
          ])
          .constraint({
             type: 'foreign key',
             foreignKey: 'user_id',
             to: 'user',
             primaryKey: 'id',
             on: 'DELETE CASCADE'
          });

      var expected  = 'CREATE TABLE "table1" ("id" integer, "user_id" integer,';
      expected += ' FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE)';
      expect(this.create.toString()).toBe(expected);

    });

  });

  it("generates a `CREATE TABLE` statement with columns, metas & constraints", function() {

    this.create.table('table1')
        .columns([
          { id: { type: 'serial' } },
          { table_id: { type: 'integer' } },
          { published: {
            type: 'datetime',
            null: false,
            'default': { ':plain': 'CURRENT_TIMESTAMP' }
          } },
          { decimal: {
            type: 'float',
            length: 10,
            precision: 2
          } },
          { integer: {
            type: 'integer',
            use: 'numeric',
            length: 10,
            precision: 2
          } },
          { date: {
            type: 'date',
            null: false
          } },
          { text: {
            type: 'text',
            null: false
          } }
        ])
        .constraints([
          {
            type: 'check',
            expr: {
              'integer': { '<': 10 }
            }
          },
          {
            type: 'foreign key',
            foreignKey: 'table_id',
            to: 'other_table',
            primaryKey: 'id',
            on: 'DELETE NO ACTION'
          }
        ]);

    var expected = 'CREATE TABLE "table1" (';
    expected += '"id" integer NOT NULL,';
    expected += ' "table_id" integer,';
    expected += ' "published" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,';
    expected += ' "decimal" numeric(10,2),';
    expected += ' "integer" numeric(10,2),';
    expected += ' "date" date NOT NULL,';
    expected += ' "text" text NOT NULL,';
    expected += ' CHECK ("integer" < 10),';
    expected += ' FOREIGN KEY ("table_id") REFERENCES "other_table" ("id") ON DELETE NO ACTION,';
    expected += ' PRIMARY KEY ("id"))';

    expect(this.create.toString()).toBe(expected);

  });

  describe(".type()", function() {

    it("returns a column type", function() {

      this.create.table('table1')
          .columns([
            { population: { type: 'integer' } },
            { city: { type: 'string', length: 255, null: false } }
          ]);

      expect(this.create.type('population')).toBe('integer');
      expect(this.create.type('city')).toBe('string');

    });

    it("returns the type string if the column name doesn't exist", function() {

      this.create.table('table1');
      expect(this.create.type('somefieldname')).toBe('string');

    });

  });

  describe(".toString()", function() {

    it("throws an exception if no table name are set", function() {

      var closure = function() {
        this.create.toString();
      }.bind(this);

      expect(closure).toThrow(new Error("Invalid `CREATE TABLE` statement missing table name."));

    });

    it("throws an exception if no column definitions are set", function() {

      var closure = function() {
        this.create.table('table1').toString();
      }.bind(this);

      expect(closure).toThrow(new Error("Invalid `CREATE TABLE` statement missing columns."));

    });

    it("throws an exception a column type is undefined", function() {

      var closure = function() {
        this.create.table('table1')
            .columns([
              { somefieldname: { type: 'invalid' } }
            ]).toString();
      }.bind(this);

      expect(closure).toThrow(new Error("Column type `'invalid'` does not exist."));

    });

    it("throws an exception a constraint type is undefined", function() {

      var closure = function() {
        this.create.table('table1')
            .columns([
              { name: { type: 'string' } }
            ])
            .constraint({ type: 'invalid' }).toString();
      }.bind(this);

      expect(closure).toThrow(new Error("Invalid constraint template `'invalid'`."));

    });

    it("throws an exception a constraint is defined with no type", function() {

      var closure = function() {
        this.create.table('table1')
            .columns([
              { name: { type: 'string' } },
            ])
            .constraint({ params: 'someparams' }).toString();
      }.bind(this);

      expect(closure).toThrow(new Error("Missing contraint type."));

    });

  });

});
