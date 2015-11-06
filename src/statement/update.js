import Statement from '../statement';

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
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags    : new Map(),
      table    : '',
      values   : {},
      where    : [],
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
    if (!this._parts.table) {
      throw new Error("Invalid `UPDATE` statement, missing `TABLE` clause.");
    }

    if (!Object.keys(this._parts.values).length) {
      throw new Error("Invalid `UPDATE` statement, missing `VALUES` clause.");
    }

    return 'UPDATE' +
      this._buildFlags(this._parts.flags) +
      this._buildChunk(this.dialect().names(this._parts.table)) +
      this._buildSet() +
      this._buildClause('WHERE',  this.dialect().conditions(this._parts.where)) +
      this._buildOrder() +
      this._buildClause('LIMIT', this._parts.limit) +
      this._buildClause('RETURNING', this.dialect().names(this._parts.returning));
  }

  /**
   * Build `SET` clause.
   *
   * @return string Returns the `SET` clause.
   */
  _buildSet() {
    var values = [];
    for (var key in this._parts.values) {
      values.push(this.dialect().name(key) + ' = ' + this.dialect().value(this._parts.values[key]));
    }
    return values.length ? ' SET ' + values.join(', ') : '';
  }
}

export default Update;