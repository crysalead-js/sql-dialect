'use strict'

const BaseInsert = require('../insert');

/**
 * `INSERT` statement.
 */
class Insert extends BaseInsert {
  /**
   * Sets some fields to the `RETURNING` clause.
   *
   * @param  Object|Array fields The fields.
   * @return Function            Returns `this`.
   */
  returning(fields) {
    if (!fields) return this

    const arr = Array.isArray(fields) ? fields : [fields]
    if (arr.length) {
      this._parts.returning.push(...arr);
    }
    return this;
  }
}

module.exports = Insert;
