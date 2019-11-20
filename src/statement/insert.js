'use strict'

const Statement = require('../statement');

/**
 * INSERT statement.
 */
class Insert extends Statement {
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
     */
    this._parts = {
      flags     : new Map(),
      into      : '',
      values    : [],
      with      : new Map(),
      returning : []
    }
  }

  /**
   * Sets the `INTO` clause value.
   *
   * @param  String   into The table name.
   * @return Function      Returns `this`.
   */
  into(into) {
    this._parts.into = into;
    return this;
  }

  /**
   * Sets the `INSERT` values.
   *
   * @param  Object   values   The record values to insert.
   * @return Function          Returns `this`.
   */
  values(values) {
    this._parts.values.push(values);
    return this;
  }


  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.into) {
      throw new Error("Invalid `INSERT` statement, missing `INTO` clause.");
    }

    const fields = this._parts.values.length ? Object.keys(this._parts.values[0]) : [];
    const dialect = this.dialect();

    return [
      this._buildCTE(),
      'INSERT',
      this._buildFlags(this._parts.flags),
      this._buildClause('INTO', dialect.name(this._parts.into, true)),
      this._buildChunk('(' + dialect.names(fields, true) + ')', false),
      this._buildValues(),
      this._buildClause('RETURNING', dialect.names(this._parts.returning, false, ''))
    ].join('');
  }

  /**
    * Build `VALUES` clause.
    *
    * @return String Returns the `VALUES` clause.
    */
  _buildValues() {
    const parts = [];
    const dialect = this.dialect();
    for (const values of this._parts.values) {
      const data = [];
      for (const [key, value] of Object.entries(values)) {
        data.push(dialect.value(value, { name: key, schema: this._schema || undefined }));
      }
      parts.push('(' + data.join(', ') + ')');
    }
    return ' VALUES ' + parts.join(', ');
  }
}

module.exports = Insert;
