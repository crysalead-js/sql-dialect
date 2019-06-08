'use strict'
const {merge} = require('extend-merge');

const Dialect = require('../dialect');
const Select = require('../statement/sqlite/select');
const Insert = require('../statement/sqlite/insert');
const Update = require('../statement/sqlite/update');
const Delete = require('../statement/sqlite/delete');
const Truncate = require('../statement/sqlite/truncate');
const CreateTable = require('../statement/create-table');
const DropTable = require('../statement/drop-table');

/**
 * Sqlite dialect.
 */
class Sqlite extends Dialect {
  /**
   * Constructor
   *
   * @param Object config The config array
   */
  constructor(config) {
    const opts = merge({}, {
      classes: Sqlite._classes,
      operators: {
        // Algebraic operations
        ':union'      : { builder: 'set' },
        ':union all'  : { builder: 'set' },
        ':except'     : { builder: 'set' }
      }
    }, config);
    super(opts);

    /**
     * Escape identifier character.
     *
     * @var String
     */
    this._escape = '"';

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
      'unique': {
        template: 'CONSTRAINT ${name} UNIQUE ${index} (${column})'
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
        collate: { keyword: 'COLLATE', escape: true },
      }
    };

    this.type('id',       { use: 'integer' });
    this.type('serial',   { use: 'integer', serial: true });
    this.type('string',   { use: 'varchar', length: 255 });
    this.type('text',     { use: 'text' });
    this.type('integer',  { use: 'integer' });
    this.type('boolean',  { use: 'boolean' });
    this.type('float',    { use: 'real' });
    this.type('decimal',  { use: 'decimal', precision: 2 });
    this.type('date',     { use: 'date' });
    this.type('time',     { use: 'time' });
    this.type('datetime', { use: 'timestamp' });
    this.type('binary',   { use: 'blob' });

    this.map('boolean',   'boolean');
    this.map('blob',      'binary');
    this.map('date',      'date');
    this.map('integer',   'integer');
    this.map('decimal',   'decimal', { precision: 2 });
    this.map('real',      'float');
    this.map('text',      'text');
    this.map('time',      'time');
    this.map('timestamp', 'datetime');
    this.map('varchar',   'string');
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
    const name = field.name;
    const type = field.type;
    const length = field.length;
    const precision = field.precision;
    const serial = field.serial;
    const nil = field.null;

    if (type === 'float' && precision) {
      use = 'numeric';
    }

    const column = this.name(name) + ' ' + this._formatColumn(use, length, precision);
    const result = [
      column,
      this.meta('column', field, ['collate'])
    ];

    if (serial) {
      result.push('NOT NULL');
    } else {
      result.push(typeof nil === 'boolean' ? (nil ? 'NULL' : 'NOT NULL') : '');
      let dft = field['default'];
      let operator = ':value';
      if (dft != null) {
        if (dft.constructor === Object) {
          operator = Object.keys(dft)[0];
          dft = dft[operator];
        }
        result.push('DEFAULT ' + this.format(operator, dft, { field: field }));
      }
    }
    return result.filter(Boolean).join(' ');
  }
}

/**
 * Class dependencies.
 *
 * @var array
 */
Sqlite._classes = {
  'select'      : Select,
  'insert'      : Insert,
  'update'      : Update,
  'delete'      : Delete,
  'truncate'    : Truncate,
  'create table': CreateTable,
  'drop table'  : DropTable
};

module.exports = Sqlite;
