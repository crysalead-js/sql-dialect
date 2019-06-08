'use strict'
const BaseSelect = require('../select');

const MODE_FOR_UPDATE = 'FOR UPDATE';
const MODE_IN_SHARE = 'LOCK IN SHARE MODE';
const SQL_CALC_FOUND_ROWS = 'SQL_CALC_FOUND_ROWS';
const SQL_CACHE = 'SQL_CACHE';
const SQL_NO_CACHE = 'SQL_NO_CACHE';
const STRAIGHT_JOIN = 'STRAIGHT_JOIN';
const HIGH_PRIORITY = 'HIGH_PRIORITY';
const SQL_BUFFER_RESULT = 'SQL_BUFFER_RESULT';
const SQL_BIG_RESULT = 'SQL_BIG_RESULT';
const SQL_SMALL_RESULT = 'SQL_SMALL_RESULT';

const LOCK_OPTS = new Set([
  'update'
, 'share'
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
      throw new Error(`Invalid MySQL lock mode \`'${_mode}'\`.`);
    }
    switch (_mode) {
      case 'update':
        this._parts.lock = MODE_FOR_UPDATE;
        break;
      case 'share':
        this._parts.lock = MODE_IN_SHARE;
        break;
      default:
        this._parts.lock = null;
    }
    return this;
  }

  /**
   * Sets `SQL_CALC_FOUND_ROWS` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  calcFoundRows(enable) {
    this.setFlag(SQL_CALC_FOUND_ROWS, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_CACHE` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  cache(enable) {
    this.setFlag(SQL_CACHE, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_NO_CACHE` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  noCache(enable) {
    this.setFlag(SQL_NO_CACHE, enable);
    return this;
  }

  /**
   * Sets `STRAIGHT_JOIN` flag.
   *
   * @param  boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  straightJoin(enable) {
    this.setFlag(STRAIGHT_JOIN, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `HIGH_PRIORITY` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  highPriority(enable) {
    this.setFlag(HIGH_PRIORITY, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_SMALL_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  smallResult(enable) {
    this.setFlag(SQL_SMALL_RESULT, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_BIG_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  bigResult(enable) {
    this.setFlag(SQL_BIG_RESULT, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_BUFFER_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  bufferResult(enable) {
    this.setFlag(SQL_BUFFER_RESULT, enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Select;
