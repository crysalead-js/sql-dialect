'use strict'
const Statement = require('../statement');

/**
 * `UPDATE` statement.
 */
class Update extends Statement {
  /**
   * Constructor.
   *
   * @param Object config The config array.
   */
  constructor(config) {
    super(config);

    /**
     * The schema.
     *
     * @var mixed
     */
    this._schema = config.schema || null;

    /**
     * The SQL parts.
     *
     * @var Object
     * @TODO support FROM clause
     */
    this._parts = {
      flags    : new Map(),
      table    : '',
      values   : {},
      where    : [],
      with     : new Map(),
      order    : new Map(),
      limit    : '',
      forUpdate: false,
      returning : []
    }
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
   * Sets the `UPDATE` values.
   *
   * @param  Object   values   The record values to insert.
   * @return Function          Returns `this`.
   */
  values(values) {
    this._parts.values = values;
    return this;
  }

  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.table) {
      throw new Error("Invalid `UPDATE` statement, missing `TABLE` clause.");
    }

    if (!Object.keys(this._parts.values).length) {
      throw new Error("Invalid `UPDATE` statement, missing `VALUES` clause.");
    }

    return [
      this._buildCTE(),
      'UPDATE',
      this._buildFlags(this._parts.flags),
      this._buildChunk(this.dialect().names(this._parts.table)),
      this._buildSet(),
      this._buildClause('WHERE',  this.dialect().conditions(this._parts.where, { schemas: {
        '': this._schema
      }})),
      this._buildOrder(),
      this._buildClause('LIMIT', this._parts.limit),
      this._buildClause('RETURNING', this.dialect().names(this._parts.returning))
    ].join('');
  }

  /**
   * Build `SET` clause.
   *
   * @return string Returns the `SET` clause.
   */
  _buildSet() {
    var values = [];
    for (var key in this._parts.values) {
      var states = { name: key };
      if (this._schema) {
        states.schema = this._schema;
      }
      values.push(this.dialect().name(key) + ' = ' + this.dialect().value(this._parts.values[key], states));
    }
    return values.length ? ' SET ' + values.join(', ') : '';
  }
}

module.exports = Update;
