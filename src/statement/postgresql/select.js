var BaseSelect = require('../select');

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
  lock(mode) {
    mode = mode || 'update';
    var lock;
    switch (mode.toLowerCase()) {
      case 'update':
        lock = 'FOR UPDATE';
        break;
      case 'share':
        lock = 'FOR SHARE';
        break;
      case 'no key update':
        lock = 'FOR NO KEY UPDATE';
        break;
      case 'key share':
        lock = 'FOR KEY SHARE';
      break;
      case false:
        lock = false;
        break;
      default:
        throw new Error("Invalid PostgreSQL lock mode `'" + mode + "'`.");
        break;
    }
    this._parts.lock = lock;
    return this;
  }
}

module.exports = Select;