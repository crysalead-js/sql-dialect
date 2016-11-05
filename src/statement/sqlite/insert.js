var BaseInsert = require('../insert');

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
    this.setFlag('OR ABORT', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR FAIL` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orFail(enable) {
    this.setFlag('OR FAIL', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR IGNORE` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orIgnore(enable) {
    this.setFlag('OR IGNORE', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR REPLACE` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orReplace(enable) {
    this.setFlag('OR REPLACE', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `OR ROLLBACK` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  orRollback(enable) {
    this.setFlag('OR ROLLBACK', enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Insert;