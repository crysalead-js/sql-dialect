'use strict'

const BaseInsert = require('../insert');
const OR_ABORT = 'OR ABORT';
const OR_FAIL = 'OR FAIL';
const OR_IGNORE = 'OR IGNORE';
const OR_REPLACE = 'OR REPLACE';
const OR_ROLLBACK = 'OR ROLLBACK';

/**
 * `INSERT` statement.
 */
class Insert extends BaseInsert {
  /**
   * Sets `OR ABORT` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orAbort(enable) {
    this.setFlag(OR_ABORT, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR FAIL` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orFail(enable) {
    this.setFlag(OR_FAIL, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR IGNORE` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orIgnore(enable) {
    this.setFlag(OR_IGNORE, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR REPLACE` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orReplace(enable) {
    this.setFlag(OR_REPLACE, enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR ROLLBACK` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orRollback(enable) {
    this.setFlag(OR_ROLLBACK, enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Insert;
