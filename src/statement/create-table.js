'use strict'
const Statement = require('../statement');

/**
 * `CREATE TABLE` statement.
 */
class CreateTable extends Statement {
  /**
   * Constructor.
   *
   * @param Object config The config array.
   */
  constructor(config) {
    super(config);

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      ifNotExists : false,
      table       : '',
      columns     : new Map(),
      constraints : [],
      meta        : {}
    }
  }

  /**
   * Sets the requirements on the table existence.
   *
   * @param  Boolean  ifNotExists If `false` the table must not exists, use `true` for a soft create.
   * @return Function             Returns `this`.
   */
  ifNotExists(ifNotExists = true) {
    this._parts.ifNotExists = ifNotExists;
    return this;
  }

  /**
   * Sets the table name to create.
   *
   * @param  String   table The table name.
   * @return Function       Returns `this`.
   */
  table(table) {
    this._parts.table = table;
    return this;
  }

  /**
   * Adds some columns to the query.
   *
   * @param  Object|Array columns A field description or an array of them.
   * @return Function             Returns `this`.
   */
  columns(columns) {
    const cols = Array.isArray(columns) && arguments.length === 1
      ? columns
      : Array.prototype.slice.call(arguments);

    for (const column of cols) {
      if (column && column.constructor === Object) {
        const key = Object.keys(column)[0];
        this._parts.columns.set(key, column[key]);
      }
    }
    return this;
  }

  /**
   * Sets some table meta to the query.
   *
   * @param  Object   meta An array of meta for the table.
   * @return Function      Returns `this`.
   */
  meta(meta) {
    if (meta) {
      this._parts.meta = meta;
    }
    return this;
  }

  /**
   * Sets constraints to the query.
   *
   * @param  Array    constraints The constraints array definition for columns.
   * @return Function             Returns `this`.
   */
  constraints(constraints) {
    if (constraints) {
      this._parts.constraints = constraints;
    }
    return this;
  }

  /**
   * Adds a constraint to the query.
   *
   * @param  Object   constraint A constraint definition.
   * @return Function            Returns `this`.
   */
  constraint(constraint) {
    if (constraint) {
      this._parts.constraints.push(constraint);
    }
    return this;
  }

  /**
   * Returns the normalized type of a column.
   *
   * @param  String name The name of the column.
   * @return String       Returns the normalized column type.
   */
  type(name) {
    const column = this._parts.columns.get(name)
    if (column && column.type !== undefined) {
      return column.type;
    }
    return 'string';
  }

  /**
   * Render the SQL statement.
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.table) {
      throw new Error("Invalid `CREATE TABLE` statement missing table name.");
    }

    if (!this._parts.columns.size) {
      throw new Error("Invalid `CREATE TABLE` statement missing columns.");
    }

    return 'CREATE TABLE' +
      this._buildFlag('IF NOT EXISTS', this._parts.ifNotExists) +
      this._buildChunk(this.dialect().name(this._parts.table)) +
      this._buildDefinition() +
      this._buildChunk(this.dialect().meta('table', this._parts.meta));
  }

  /**
   * Helper for building columns definition.
   *
   * @return String The SQL columns definition.
   */
  _buildDefinition() {
    let primary;
    const result = [];
    const columns = this._parts.columns;
    const constraints = this._parts.constraints;
    const dialect = this.dialect()

    for (const [name, column] of columns.entries()) {
      const opts = Object.assign({ name }, column);
      const field = dialect.field(opts);

      if (field.serial) {
        primary = name;
      }
      result.push(dialect.column(field));
    }

    for (var constraint of constraints) {
      if (constraint.type === undefined) {
        throw new Error("Missing contraint type.");
      }
      const type = constraint.type;
      const meta = dialect.constraint(type, constraint, { schemas: {'': this } })

      if (meta) {
        result.push(meta);
      }

      if (type === 'primary') {
        primary = null;
      }
    }

    if (primary) {
      result.push(dialect.constraint('primary', { column: primary }));
    }


    return ` (${result.filter(Boolean).join(', ')})`;
  }

}

module.exports = CreateTable;
