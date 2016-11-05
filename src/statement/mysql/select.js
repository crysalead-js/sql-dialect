var BaseSelect = require('../select');

/**
 * `SELECT` statement.
 */
class Select extends BaseSelect {
  /**
   * Sets `SQL_CALC_FOUND_ROWS` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  calcFoundRows(enable) {
    this.setFlag('SQL_CALC_FOUND_ROWS', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_CACHE` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  cache(enable) {
    this.setFlag('SQL_CACHE', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_NO_CACHE` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  noCache(enable) {
    this.setFlag('SQL_NO_CACHE', enable);
    return this;
  }

  /**
   * Sets `STRAIGHT_JOIN` flag.
   *
   * @param  boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  straightJoin(enable) {
    this.setFlag('STRAIGHT_JOIN', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `HIGH_PRIORITY` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  highPriority(enable) {
    this.setFlag('HIGH_PRIORITY', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_SMALL_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  smallResult(enable) {
    this.setFlag('SQL_SMALL_RESULT', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_BIG_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  bigResult(enable) {
    this.setFlag('SQL_BIG_RESULT', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `SQL_BUFFER_RESULT` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  bufferResult(enable) {
    this.setFlag('SQL_BUFFER_RESULT', enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Select;