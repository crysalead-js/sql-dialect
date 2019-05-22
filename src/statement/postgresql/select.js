'use strict'
const  BaseSelect = require('../select');


const LOCK_OPTS = new Set([
  'update'
, 'share'
, 'no key update'
, 'key share'
, false
]);
/**
 * `SELECT` statement.
 */
class Select extends BaseSelect {

  /**
   * Set the lock mode.
   *
   * @param  Boolean mode The lock mode.
   * @return self         Returns `this`.
   */
  lock(mode = 'update') {
    const _mode = mode.toLowerCase();

    if (!LOCK_OPTS.has(_mode)) {
      throw new Error(`Invalid PostgreSQL lock mode \`'${_mode}'\`.`);
    }

    switch (_mode) {
      case 'update':
        this._parts.lock = 'FOR UPDATE';
        break;
      case 'share':
        this._parts.lock = 'FOR SHARE';
        break;
      case 'no key update':
        this._parts.lock = 'FOR NO KEY UPDATE';
        break;
      case 'key share':
        this._parts.lock = 'FOR KEY SHARE';
      break;
      default:
        this._parts.lock = null;
        break;
    }
    return this;
  }
}

module.exports = Select;
