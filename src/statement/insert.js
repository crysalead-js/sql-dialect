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
     * The type detector callable.
     *
     * @var callable
     */
    this._type = null;

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags     : new Map(),
      into      : '',
      values    : [],
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
   * @param  Function callable The type detector handler.
   * @return Function          Returns `this`.
   */
  values(values, callable) {
    this._parts.values.push(values);
    this._type = callable;
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

    var fields = this._parts.values.length ? Object.keys(this._parts.values[0]) : [];

    return 'INSERT' +
      this._buildFlags(this._parts.flags) +
      this._buildClause('INTO', this.dialect().name(this._parts.into, true)) +
      this._buildChunk('(' + this.dialect().names(fields, true) + ')', false) +
      this._buildValues() +
      this._buildClause('RETURNING', this.dialect().names(this._parts.returning, false, ''));
  }

  /**
    * Build `VALUES` clause.
    *
    * @return String Returns the `VALUES` clause.
    */
  _buildValues() {
    var parts = [];

    for (var values of this._parts.values) {
      var data = [];
      for (var key in values) {
        var states = { name: key };
        if (this._type) {
          states.type = this._type;
        }
        data.push(this.dialect().value(values[key], states));
      }
      parts.push('(' + data.join(', ') + ')');
    }
    return ' VALUES ' + parts.join(', ');
  }
}

export default Insert;