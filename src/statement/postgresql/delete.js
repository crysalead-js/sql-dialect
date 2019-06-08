'use strict'
const BaseDelete = require('../delete');

/**
 * `DELETE` statement.
 */
class Delete extends BaseDelete {
  /**
   * Sets some fields to the `RETURNING` clause.
   *
   * @param  Object|Array fields The fields.
   * @return Function            Returns `this`.
   */
  returning(fields) {
    const arr = Array.isArray(fields) && arguments.length === 1
      ? fields
      : Array.prototype.slice.call(arguments);
    if (fields) {
      this._parts.returning.push(...arr);
    }
    return this;
  }
}

module.exports = Delete;
