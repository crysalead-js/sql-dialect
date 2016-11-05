var BaseInsert = require('../insert');

/**
 * `INSERT` statement.
 */
class Insert extends BaseInsert {
  /**
   * Sets `HIGH_PRIORITY` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  highPriority(enable) {
    this.setFlag('HIGH_PRIORITY', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `LOW_PRIORITY` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  lowPriority(enable) {
    this.setFlag('LOW_PRIORITY', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `IGNORE` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  ignore(enable) {
    this.setFlag('IGNORE', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `DELAYED` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  delayed(enable) {
    this.setFlag('DELAYED', enable === undefined ? true : enable);
    return this;
  }

}

module.exports = Insert;