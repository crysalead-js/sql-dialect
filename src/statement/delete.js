'use strict'

const Statement = require('../statement');
const FROM = 'FROM';
const WHERE = 'WHERE';
const LIMIT = 'LIMIT';
const RETURNING = 'RETURNING';
const DELETE = 'DELETE';
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
    const opts = Object.assign({}, { schema: null }, config);
    super(opts);

    /**
     * The schema.
     *
     * @var mixed
     */
    this._schema = opts.schema;

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags    : new Map(),
      from     : '',
      where    : [],
      with     : new Map(),
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

    const dialect = this.dialect();
    return [
      this._buildCTE(),
      DELETE,
      this._buildFlags(this._parts.flags),
      this._buildClause(FROM, dialect.names(this._parts.from)),
      this._buildClause(WHERE,  dialect.conditions(this._parts.where, {
        schemas: { '': this._schema }
      })),
      this._buildOrder(),
      this._buildClause(LIMIT, this._parts.limit),
      this._buildClause(RETURNING, dialect.names(this._parts.returning))
    ].join('');
  }

}

module.exports = Delete;
