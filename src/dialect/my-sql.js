'use strict'
const {merge} = require('extend-merge');

const Dialect = require('../dialect');
const Select = require('../statement/mysql/select');
const Insert = require('../statement/mysql/insert');
const Update = require('../statement/mysql/update');
const Delete = require('../statement/mysql/delete');
const Truncate = require('../statement/truncate');
const CreateTable = require('../statement/create-table');
const DropTable = require('../statement/drop-table');
const BLOB_COLUMNS = new Set(['text', 'blob', 'geometry', 'json']);

/**
 * MySQL dialect.
 */
class MySql extends Dialect {
  /**
   * Constructor
   *
   * @param Object config The config array
   */
  constructor(config) {
    const opts = merge({
      classes: MySql._classes,
      operators: {
        '#'           : { format: '%s ^ %s' },
        ':regexp'     : { format: '%s REGEXP %s' },
        // Algebraic operations
        ':union'      : { builder: 'set' },
        ':union all'  : { builder: 'set' },
        ':minus'      : { builder: 'set' },
        ':except'     : { name: 'MINUS', builder: 'set' }
      }
    }, config);
    super(opts);

    /**
     * Escape identifier character.
     *
     * @var String
     */
    this._escape = '`';

    /**
     * Column contraints template
     *
     * @var Object
     */
    this._constraints = {
      'primary': { template: 'PRIMARY KEY (${column})' },
      'foreign key': {
        template: 'FOREIGN KEY (${foreignKey}) REFERENCES ${to} (${primaryKey}) ${on}'
      },
      'index': { template: 'INDEX ${name} (${column})' },
      'unique': {
        template: 'UNIQUE ${index} ${name} (${column})',
        key: 'KEY',
        index: 'INDEX'
      },
      'check': { template: '${constraint} CHECK (${expr})' }
    };

    /**
     * Meta attribute syntax pattern.
     *
     * Note: by default `'escape'` is false and 'join' is `' '`.
     *
     * @var Object
     */
    this._meta = {
      column: {
        charset: { keyword: 'CHARACTER SET' },
        collate: { keyword: 'COLLATE' },
        comment: { keyword: 'COMMENT', escape: true }
      },
      table: {
        charset: { keyword: 'DEFAULT CHARSET' },
        collate: { keyword: 'COLLATE' },
        engine:  { keyword: 'ENGINE' },
        tablespace: { keyword: 'TABLESPACE' }
      }
    };

    this.type('id',       { use: 'int' });
    this.type('serial',   { use: 'int', serial: true });
    this.type('string',   { use: 'varchar', length: 255 });
    this.type('text',     { use: 'text' });
    this.type('integer',  { use: 'int' });
    this.type('boolean',  { use: 'boolean' });
    this.type('float',    { use: 'float' });
    this.type('decimal',  { use: 'decimal', precision: 2 });
    this.type('date',     { use: 'date' });
    this.type('time',     { use: 'time' });
    this.type('datetime', { use: 'datetime' });
    this.type('binary',   { use: 'blob' });

    this.map('bigint',             'integer');
    this.map('bit',                'string');
    this.map('blob',               'string');
    this.map('char',               'string');
    this.map('date',               'date');
    this.map('datetime',           'datetime');
    this.map('decimal',            'decimal');
    this.map('double',             'float');
    this.map('float',              'float');
    this.map('geometry',           'string');
    this.map('geometrycollection', 'string');
    this.map('int',                'integer');
    this.map('linestring',         'string');
    this.map('longblob',           'string');
    this.map('longtext',           'string');
    this.map('mediumblob',         'string');
    this.map('mediumint',          'integer');
    this.map('mediumtext',         'string');
    this.map('multilinestring',    'string');
    this.map('multipolygon',       'string');
    this.map('multipoint',         'string');
    this.map('point',              'string');
    this.map('polygon',            'string');
    this.map('smallint',           'integer');
    this.map('text',               'string');
    this.map('time',               'string');
    this.map('timestamp',          'datetime');
    this.map('tinyblob',           'string');
    this.map('tinyint',            'boolean', { length: 1 });
    this.map('tinyint',            'integer');
    this.map('tinytext',           'string');
    this.map('varchar',            'string');
    this.map('year',               'string');
  }

  /**
   * Helper for creating columns
   *
   * @see    Dialect::column()
   *
   * @param  Object field A field definition
   * @return String       The SQL column string
   */
  _column(field) {
    let use = field.use;
    const nil = field.null;
    const name = field.name;
    const type = field.type;
    const length = field.length;
    const precision = field.precision;
    const serial = field.serial;

    if (type === 'float' && precision) {
      use = 'decimal';
    }

    const column = this.name(name) + ' ' + this._formatColumn(use, length, precision);
    const result = [
      column,
      this.meta('column', field, ['charset', 'collate'])
    ];


    if (serial) {
      result.push('NOT NULL AUTO_INCREMENT');
    } else {
      result.push(typeof nil === 'boolean' ? (nil ? 'NULL' : 'NOT NULL') : '');
      let dft = field['default'];
      if (dft != null && !BLOB_COLUMNS.has(use.toLowerCase())) {
        let operator = ':value';
        if (dft.constructor === Object) {
          operator = Object.keys(dft)[0];
          dft = dft[operator];
        }
        result.push('DEFAULT ' + this.format(operator, dft, { field: field }));
      }
    }

    result.push(this.meta('column', field, ['comment']));
    return result.filter(Boolean).join(' ');
  }
}

/**
 * Class dependencies.
 *
 * @var array
 */
MySql._classes = {
  'select'      : Select,
  'insert'      : Insert,
  'update'      : Update,
  'delete'      : Delete,
  'truncate'    : Truncate,
  'create table': CreateTable,
  'drop table'  : DropTable
};

module.exports = MySql;
