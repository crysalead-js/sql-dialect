import Statement from '../statement';

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
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags     : new Map(),
      into      : '',
      values    : {},
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
   * @param  Object   values The record values to insert.
   * @return Function        Returns `this`.
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
    if (!this._parts.into) {
      throw new Error("Invalid `INSERT` statement, missing `INTO` clause.");
    }

    var fields = Object.keys(this._parts.values);
    var values = [];
    for (var i = 0, len = fields.length; i < len; i++) {
      values.push(this.dialect().value(this._parts.values[fields[i]]));
    }

    return 'INSERT' +
      this._buildFlags(this._parts.flags) +
      this._buildClause('INTO', this.dialect().name(this._parts.into, true)) +
      this._buildChunk('(' + this.dialect().names(fields, true) + ')', false) +
      this._buildChunk('VALUES (' + values.join(', ') + ')') +
      this._buildClause('RETURNING', this.dialect().names(this._parts.returning, false, ''));
  }

}

export default Insert;