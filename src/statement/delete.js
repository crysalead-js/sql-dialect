import Statement from '../statement';

/**
 * `DELETE` statement.
 */
class Delete extends Statement {
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
      from     : '',
      where    : [],
      order    : new Map(),
      limit    : '',
      returning: []
    }
  }

  /**
   * Sets the table name to create.
   *
   * @param  String   from The table name.
   * @return Function      Returns `this`.
   */
  from(from) {
    this._parts.from = from;
    return this;
  }

  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.from) {
      throw new Error("Invalid `DELETE` statement, missing `FROM` clause.");
    }

    return 'DELETE' +
      this._buildFlags(this._parts.flags) +
      this._buildClause('FROM', this.dialect().names(this._parts.from)) +
      this._buildClause('WHERE',  this.dialect().conditions(this._parts.where)) +
      this._buildOrder() +
      this._buildClause('LIMIT', this._parts.limit) +
      this._buildClause('RETURNING', this.dialect().names(this._parts.returning));
  }

}

export default Delete;