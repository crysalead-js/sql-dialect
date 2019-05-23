'use strict'
const BaseUpdate = require('../update');
const LOW_PRIORITY = 'LOW_PRIORITY'
const IGNORE = 'IGNORE'

/**
 * `UPDATE` statement.
 */
class Update extends BaseUpdate {
  /**
   * Sets `LOW_PRIORITY` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  lowPriority(enable = true) {
    this.setFlag(LOW_PRIORITY, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `IGNORE` flag.
   *
   * @param  Boolean enable A boolan value.
   * @return Function       Returns `this`.
   */
  ignore(enable = true) {
    this.setFlag(IGNORE, enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Update;
