var BaseDelete = require('../delete');

/**
 * `DELETE` statement.
 */
class Delete extends BaseDelete {
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
  ignore(enable)
  {
    this.setFlag('IGNORE', enable === undefined ? true : enable);
    return this;
  }

  /**
   * Sets `QUICK` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function        Returns `this`.
   */
  quick(enable) {
    this.setFlag('QUICK', enable === undefined ? true : enable);
    return this;
  }
}

module.exports = Delete;