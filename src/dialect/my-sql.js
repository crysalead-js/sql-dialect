var extend = require('extend-merge').extend;
var merge = require('extend-merge').merge;

var Dialect = require('../dialect');
var Select = require('../statement/mysql/select');
var Insert = require('../statement/mysql/insert');
var Update = require('../statement/mysql/update');
var Delete = require('../statement/mysql/delete');
var Truncate = require('../statement/truncate');
var CreateTable = require('../statement/create-table');
var DropTable = require('../statement/drop-table');

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
    var defaults = {
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
    };

    var config = merge(defaults, config);
    super(config);

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
    var name = field.name;
    var use = field.use;
    var type = field.type;
    var length = field.length;
    var precision = field.precision;
    var serial = field.serial;
    var nil = field.null;
    var dft = field['default'];

    if (type === 'float' && precision) {
      use = 'decimal';
    }

    var column = this.name(name) + ' ' + this._formatColumn(use, length, precision);

    var result = [column];
    result.push(this.meta('column', field, ['charset', 'collate']));

    if (serial) {
      result.push('NOT NULL AUTO_INCREMENT');
    } else {
      result.push(typeof nil === 'boolean' ? (nil ? 'NULL' : 'NOT NULL') : '');
      if (dft != null && ['text', 'blob', 'geometry', 'json'].indexOf(use.toLowerCase()) === -1) {
        if (dft.constructor === Object) {
          var operator = Object.keys(dft)[0];
          dft = dft[operator];
        } else {
          operator = ':value';
        }
        result.push('DEFAULT ' + this.format(operator, dft, { field: field }));
      }
    }

    result.push(this.meta('column', field, ['comment']));
    result = result.filter(function(value) {
      return !!value;
    });
    return result.join(' ');
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