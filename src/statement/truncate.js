var extend = require('extend-merge').extend;
var Statement = require('../statement');

/**
 * `TRUNCATE` statement.
 */
class Truncate extends Statement {


  /**
   * Constructor.
   *
   * @param Object config The config array.
   */
  constructor(config) {
    super(config);

    var defaults = {
      schema: null
    };
    config = extend({}, defaults, config);

    /**
     * The schema.
     *
     * @var mixed
     */
    this._schema = config.schema;

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      table : ''
    }
  }

  /**
   * Sets the table name to create.
   *
   * @param  String   table The table name.
   * @return Function       Returns `this`.
   */
  table(table) {
    this._parts.table = table;
    return this;
  }

  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    if (!this._parts.table) {
      throw new Error("Invalid `TRUNCATE` statement, missing `TABLE` clause.");
    }

    return 'TRUNCATE' + this._buildClause('TABLE', this.dialect().names(this._parts.table));
  }

}

module.exports = Truncate;
