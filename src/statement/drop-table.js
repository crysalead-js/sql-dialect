'use strict'
const Statement = require('../statement');

const IF_EXISTS = 'IF EXISTS';
const CASCADE = 'CASCADE';
const RESTRICT = 'RESTRICT';

/**
 * `DROP TABLE` statement.
 */
class DropTable extends Statement {
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
      ifExists : false,
      table    : [],
      cascade  : false,
      restrict : false
    }
  }

  /**
   * Sets the requirements on the table existence.
   *
   * @param  Boolean  ifExists If `false` the table must exists, use `true` for a soft drop.
   * @return Function          Returns `this`.
   */
  ifExists(ifExists) {
    this._parts.ifExists = ifExists === undefined ? true : ifExists;
    return this;
  }

  /**
   * Set the table name to create.
   *
   * @param  Array    table The table names.
   * @return Function       Returns `this`.
   */
  table(...tables) {
    this._parts.table = tables;
    return this;
  }

  /**
   * Sets cascading value.
   *
   * @param  Boolean  cascade If `true` the related views or objects will be removed.
   * @return Function         Returns `this`.
   */
  cascade(cascade = true) {
    this._parts.cascade = cascade;
    return this;
  }

  /**
   * Sets restricting value.
   *
   * @param  Boolean  restrict If `true` the table won't be removed if the related views or objects exists.
   * @return Function          Returns `this`.
   */
  restrict(restrict = true) {
    this._parts.restrict = restrict;
    return this;
  }

  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.table.length) {
      throw new Error("Invalid `DROP TABLE` statement, missing `TABLE` clause.");
    }

    return 'DROP TABLE' +
      this._buildFlag(IF_EXISTS, this._parts.ifExists) +
      this._buildChunk(this.dialect().names(this._parts.table)) +
      this._buildFlag(CASCADE, this._parts.cascade) +
      this._buildFlag(RESTRICT, this._parts.restrict);
  }
}

module.exports = DropTable;
