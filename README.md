# sql-dialect

[![Build Status](https://travis-ci.org/crysalead-js/sql-dialect.png?branch=master)](https://travis-ci.org/crysalead-js/sql-dialect)
[![Coverage Status](https://coveralls.io/repos/crysalead-js/sql-dialect/badge.svg)](https://coveralls.io/r/crysalead-js/sql-dialect)

This library provides query builders independent of any particular database connection library.

## Install

```bash
npm install sql-dialect
```

## Main Features

* Supports MySQL, PostgreSQL and Sqlite
* Uses the [prefix notation](https://en.wikipedia.org/wiki/Polish_notation) for building queries
* Supports `SELECT`, `UPDATE`, `INSERT` and `DELETE`
* Supports `CREATE TABLE` and `DROP TABLE`

## Documentation

### Dialect Classes

`Dialect` classes are used to generate SQL queries. The available `Dialect` classes are:

* `sql/dialect/MySql`: MySql dialect.
* `sql/dialect/PostgreSql`: PostgreSql dialect.
* `sql/dialect/Sqlite`: Sqlite dialect.
* `sql/Dialect`: the generic SQL one

Let's start by instantiating a `MySql` dialect class:

```js
var SQL = require('sql-dialect');

var dialect = new SQL.MySql();
```

Once instantiated, it's possible to use the dialect's `.statement()` method to create query instances like in the following:

```js
var select = dialect.statement('select');
var insert = dialect.statement('insert');
var update = dialect.statement('update');
var delete = dialect.statement('delete');

var createTable = dialect.statement('create table');
var dropTable = dialect.statement('drop table');
```

Then to generate the corresponding SQL, we need to use either `toString()`:

```js
select.from('mytable');
console.log(select.toString()); // SELECT * FROM "mytable"
console.log(String(select));    // SELECT * FROM "mytable"
```

Since the SQL generated is independent of any particular database connection library so you can any other database connection library of your choice, to execute the query.

### Quoting

By default string values are automatically quoted, however some database connections provide their own built-in quoting method. If you are not using PDO you will probably want to override the default quoting handler. To do so, you'ss need to inject your handler to the dialect instance like in the following:

```js
var pg = require('pg-promise')();
var SQL = require('sql-dialect');

var connection = pg({user: 'postgres', password: 'password', database: 'mytable'});
var dialect = new SQL.PostgreSql({ quoter: function(string) {
    return pgp.as.text(string);
} });
```

Note: to avoid SQL injections, table/field names are also escaped by default.

### SELECT

Example of `SELECT` query:

```js
select
  .distinct()                   // SELECT DISTINCT
  .fields([
    'id',                       // a field name
    { fielname: 'alias' }       // a aliased field name
  ])
  .from('table')                // FROM
  .join(                        // JOIN
    'other',                    // a table name
    [{ 'other.table_id': {      // join conditions, (more information on
      ':name': 'table.id'       // { ':name': ... } in the Prefix Notation section)
    } }],
    'LEFT'                      // type of join
  )
  .where([                      // WHERE `fieldname` === 'value'
    { fielname: 'value' }
  ])
  .group('foo')                 // GROUP BY
  .having([                     // HAVING `fieldname` === 'value'
    { fielname: 'value' }
  ])
  .order('bar')                 // ORDER BY
  .limit(10, 40)                // LIMIT AND OFFSET AS SECOND PARAMETER
  .forUpdate()                  // FOR UPDATE
```

#### Prefix Notation (or polish notation)

To be able to write complex SQL queries, the prefix notation has been choosed instead of relying on an exhaustive API with a lot of methods (i.e. methods like `orWhere`, `andWhere`, `whereNull()`, etc.) which generally ends up to have missing methods anyway.

Infix notation is the most populare arithmetical notation. It's characterized by the placement of operators **between** operands (e.g. `3 + 4`). With the prefix notation, the operator is placed to the **left** of their operands (e.g. `+ 3 4`).

For a developper this notation is pretty intuitive since it's very similar to how functions are defined. `+` is in a way the function name and `3` and `4` are the arguments.

So to be able to build complex queries without being limitated by the API, this library allows prefix notation like in the following:

```js
select.fields({ '*': [
  { '+': [1, 2] }, 3
] });
console.log(select.toString());            // SELECT 1 + 2 * 3

select.fields({ '*': [
  { ':()': { '+': [1, 2] } }, 3
] });
console.log(select.toString());            // SELECT (1 + 2) * 3
```

You probably had to read the example twice. But if it looks quite confusing at a first glance, prefix notation has a couple of advantages:*
* it's can represent any kind of expression by definition.
* it's not SQL dedicated and can be used in a higher level of abstraction.
* it's simpler to deal with programmatically than parsing/unparsing SQL strings, since it's a mathematical abstraction.

Note: all named operators are prefixed by a colon `:` (e.g `:or`, `:and`, `:like`, ':in', etc.). However mathematical symbol like `+`, `-`, `<=`, etc. doesn't requires a colon.

#### Formatters

Formatters are used to deal with the three different types of values present in SQL:

1. the table/field names which need to be escaped.
2. the values which needs to be quotes like string values.
3. the plain expressions.

So, to be able to choose the formatting, the following formatters has been introduced:

* `':name'`: escapes a table/field names.
* `':value'`: quotes string values.
* `':plain'`: doesn't do anything (warning: `':plain'` is subject to SQL injection)

Since most of queries relies on the following kind of condition: `field = value`, you don't need to specify the formatting everywhere. For example you can simply write your select conditions like the following:

```js
select.from('table').where([
  { field1: 'value1' },
  { field2: 'value2' }
]);
console.log(select.toString());
// SELECT * FROM `table` WHERE `field1` = 'value1' AND `field2` = 'value2'
```

which can be rewrited as:

```js
select.from('table').where([
  { field: { ':value': 'value' }
]);
```

which can also be rewrited as:

```js
select.from('table').where([
    { '=': [{ ':name': 'field' }, { ':value': 'value' }] }
]);
```

So most of the time the `{ field: 'value' }` syntax will fit prefectly well to your need. However if you wan't to make a `field1 = field2` condition where both part must be escaped, the prefix notation can save your day:

```js
select.from('table').where([
  { field1: { ':name': 'field2' }
]);
```

#### Common Operators

Bellow an exhaustive list of common operators which work for both MySQL and PostgreSQL:

* `'='`
* `'<=>'`
* `'<'`
* `'>'`
* `'<='`
* `'>='`
* `'!='`
* `'<>'`
* `'-'`
* `'+'`
* `'*'`
* `'/'`
* `'%'`
* `'>>'`
* `'<<'`
* `':='`
* `'&'`
* `'|'`
* `':mod'`
* `':div'`
* `':like'`
* `':not like'`
* `':is'`
* `':is not'`
* `':distinct'`
* `'~'`
* `':between'`
* `':not between'`
* `':in'`
* `':not in'`
* `':exists'`
* `':not exists'`
* `':all'`
* `':any'`
* `':some'`
* `':as'`
* `':not'`
* `':and'`
* `':or'`
* `':xor'`
* `'()'`

It's also possible to use some "free" operators. All used operators which are not present in the list above will be considered as SQL functions like `:concat`, `:sum`, `:min`, `:max`, etc. and will be generated as `FUNCTION(...)`.

For example:

```js
select
  .fields([
    {':sum()': [{':name': 'x'}, 2])
  ])
  .from('table')

// SELECT SUM("x", 2) from "table"
```
#### MySQL Dedicated Operators

* `'#'`
* `':regex'`
* `':rlike'`
* `':sounds like'`
* `':union'`
* `':union all`'
* `':minus'`
* `':except'`

#### PostgreSQL Dedicated Operators

* `':regex'`
* `':regexi'`
* `':not regex'`
* `':not regexi'`
* `':similar to'`
* `':not similar to'`
* `':square root'`
* `':cube root'`
* `':fact'`
* `'|/'`
* `'||/'`
* `'!!'`
* `':concat'`
* `':pow'`
* `'#'`
* `'@'`
* `'<@'`
* `'@>'`
* `':union'`
* `':union all'`
* `':except'`
* `':except all'`
* `':intersect'`
* `':intersect all'`

#### Custom Dedicated Operators

It's also possible to create your own operators with handlers to build them.

Example:

```js
var dialect = new SQL.PostgreSql({
  builders: {
    braces: function ($operator, $parts) {
      return "{" . array_shift($parts)  ."}";
    }
  },
  operators: {
    '{}': { builder: 'braces' }
    // Note: { format: '{%s}' } would also be enough here.
  }
});

var select = dialect.statement('select');
select.fields([{ '{}': [1] }]); // SELECT {1}
]]);
```

The example above allows to use `'{}'` as operator and provides the following formatting `'{%s}'`.

#### Subqueries

To use a subquery inside another query or doing some algebraic operations on queries (i.e. `UNION`, `INTERSECT`, etc.), you can simply mix them together:

Example of `JOIN` on a subquery:

```js
var subquery = dialect.statement('select')
subquery.from('table2').alias('t2');

select.from('table').join($subquery);

select.toString();
// SELECT * FROM "table" LEFT JOIN (SELECT * FROM "table2") AS "t2"
```

Example of `UNION` query:

```js
var select1 = dialect.statement('select').from('table1');
var select2 = dialect.statement('select').from('table2');

dialect.conditions([
  { ':union': [select1, select2] }
]);
// SELECT * FROM `table1` UNION SELECT * FROM `table2`
```

### INSERT

Example of `INSERT` query:

```js
var insert = dialect.statement('insert');

insert.into('table')               // INTO
      .values([                    // (field1, ...) VALUES (value1, ...)"
        { field1: 'value1', field2: 'value2', anotherField: 'value3' }
      );
```

The `values()` method allows you to pass an object of key-value pairs where the key is the field name and value the field value.

#### Common Table Expressions

To use common table expressions, you use the `with` function on any statement instance (`INSERT`, `UPDATE`, `DELETE` `SELECT`).
Pass an object mapping key names to any other query

```js

var update = dialect
  .statement('update')
  .table('foo')
  .values([
    { field1: 'value1' },
    { field2: 'value2' }
  ])
  .where({ id: 123 })
  .returning(['id']);

select
  .with({foo_cte: update})
  .from('table')
  .join('foo', [
    {'foo_cte.id': {':name': 'table.foo_id'}}
  ], 'LEFT');

select.toString();
// WITH foo_cte AS (
//   UPDATE foo
//   SET
//      "field1" = 'value1',
//      "field2" = 'value2'
//    WHERE "id" = '123'
//    RETURNING id
//  )
// SELECT *
// FROM "table"
//  LEFT JOIN "foo_cte"."id" ON "foo_cte"."id" = "table"."foo_id"
```
### UPDATE

Example of `UPDATE` query:

```js
var update = dialect.statement('update');

$update.table('table')              // TABLE
       .values([                    // (field1, ...) VALUES (value1, ...)"
         { field1: 'value1' },
         { field2: 'value2' }
       ])
       .where({ id: 123 });         // WHERE
```

The `values()` method allows you to pass an array of key-value pairs where the key is the field name and value the field value.

### DELETE

Example of `DELETE` query:

```js
var delete = dialect.statement('delete');

delete.from('table')                 // FROM
      .where({ id: 123 });           // WHERE
```

### CREATE TABLE

Example of `CREATE TABLE` query:

```js
var createTable = dialect.statement('create table');
createTable
    .table('table')                 // TABLE
    .columns([])                    // columns definition
    .meta([])                       // table meta definition
    .constraints([]);               // constraints definition
```

Bellow an example of a MySQL table creation:

```js
var createTable = dialect.statement('create table');
createTable
    .table('table')
    .columns([
        { id: { type: 'serial' } },
        { table_id: { type: 'integer' } },
        { published: {
          { type: 'datetime' },
          { null: false },
          { 'default': { ':plain': 'CURRENT_TIMESTAMP' } }
        },
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
          null: false,
        } },
        { text: {
          type: 'text',
          null: false,
        } }
    ])
    .meta({
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      engine: 'InnoDB'
    })
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

this.create.toString();
// CREATE TABLE `table` (
// `id` int NOT NULL AUTO_INCREMENT,
// `table_id` int,
// `published` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
// `decimal` decimal(10,2),
// `integer` numeric(10,2),
// `date` date NOT NULL,
// `text` text NOT NULL,
// CHECK (`integer` < 10),
// FOREIGN KEY (`table_id`) REFERENCES `other_table` (`id`) ON DELETE NO ACTION,
// PRIMARY KEY (`id`))
// DEFAULT CHARSET utf8 COLLATE utf8_unicode_ci ENGINE InnoDB
```

#### Abstract types

Databases uses different naming conventions for types which can be missleading. To be the most generic possible, columns definition can be done using some abstract `'type'` definitions. Out of the box the following types are supported:

* `'id'`: foreign key ID
* `'serial'`: autoincremented serial primary key
* `'string'`: string value
* `'text'`: text value
* `'integer'`: integer value
* `'boolean'`: boolean value
* `'float'`: foat value
* `'decimal'`: decimal value with 2 decimal places
* `'date'`: date value
* `'time'`: time value
* `'datetime'`: datetime value
* `'binary'`: binary value

For example with MySQL the `'serial'` type will generate the following query:

```js
var createTable = dialect.statement('create table');
createTable.table('table')
           .columns([
             { id:  { type: 'serial' } }
           ]);

this.create.toString();
// CREATE TABLE `table` (`id` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`))
```

And PostgreSQL will generate:

```js
var createTable = dialect.statement('create table');
createTable.table('table')
           .columns([
             { id:  { type: 'serial' } }
           ]);

this.create.toString();
// CREATE TABLE "table" ("id" serial NOT NULL, PRIMARY KEY ("id"))
```

However it's possible to add your own abstract types. For example to make `'uuid'` to stand for `char(30)` columns, we can write:

```js
var dialect = new SQL.MySql();
dialect.type('uuid', { use: 'char', length: 30 });
```

If you don't want to deal with abstract types you can use directly `'use'` instead of `'type'` to define a column:

```js
var createTable = dialect.statement('create table');
createTable.table('table')
           .columns([
             { id: { type: 'serial' } },
             { data: { use: 'blob' } }
           ]);
```

#### Abstract types autodetection

When you are using abstract types, it would be interesting to be able to map databases type to their corresponding abstract type.

Example:
```js
dialect.map('tinyint', 'boolean', { length: 1 });
dialect.map('tinyint', 'integer');

dialect.mapped('tinyint'); // integer
dialect.mapped({           // boolean
  use: 'tinyint'
  length: 1
});
```

Note: for databases like SQLite this won't help much since types are not discriminative enough but this feature can be useful for PostgreSQL or MySQL.

### DROP TABLE

Example of `DROP TABLE` query:

```js
var dropTable = dialect.statement('drop table');

dropTable.table('table');         // TABLE
```

## Testing

The spec suite can be runned with:

```
cd sql-dialect
npm install
npm test
```
