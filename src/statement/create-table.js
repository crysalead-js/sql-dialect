var extend = require('extend-merge').extend;
var merge = require('extend-merge').merge;
var Statement = require('../statement');

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
  ifNotExists(ifNotExists = true)
  {
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
    var columns = Array.isArray(columns) && arguments.length === 1 ? columns : Array.prototype.slice.call(arguments);
    var len = columns.length;
    for (var i = 0; i < len; i++) {
      var column = columns[i];
      if (column && column.constructor === Object) {
        var key = Object.keys(column)[0];
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
    if (this._parts.columns.has(name) && this._parts.columns.get(name).type !== undefined) {
      return this._parts.columns.get(name).type;
    }
    return 'string';
  }

  /**
   * Render the SQL statement.
   *
   * @return String The generated SQL string.
   */
  toString()
  {
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
    var result = [];
    var columns = this._parts.columns;
    var constraints = this._parts.constraints;
    var primary;

    columns.forEach(function(column, name) {
      var field = extend({}, column);
      field.name = name;
      field = this.dialect().field(field);

      if (field.serial) {
        primary = name;
      }
      result.push(this.dialect().column(field));
    }.bind(this));

    for (var constraint of constraints) {
      if (constraint.type === undefined) {
        throw new Error("Missing contraint type.");
      }
      var meta, type = constraint.type;
      if (meta = this.dialect().constraint(type, constraint, { schemas: {'': this } })) {
        result.push(meta);
      }
      if (type === 'primary') {
        primary = null;
      }
    }
    if (primary) {
      result.push(this.dialect().constraint('primary', { column: primary }));
    }

    result = result.filter(function(value) {
      return !!value;
    });

    return ' (' + result.join(', ') + ')';
  }

}

module.exports = CreateTable;