'use strict'

const ORDER_DIR_ASC = 'ASC';
const ORDER_DIR_EXP = /^(.*?)\s+((?:a|de)sc)/i;

class Statement {

  /**
   * Constructor
   *
   * @param Object config The config object. The option is:
   *                       - 'dialect' `object` a dialect adapter.
   */
  constructor(config = {}) {

    /**
     * Pointer to the dialect adapter.
     *
     * @var Function
     */
    this._dialect = config.dialect;

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags: new Map(),
      where: [],
      with: new Map(),
      order: new Map(),
      limit: ''
    };
  }

  /**
   * Gets/sets the dialect instance
   *
   * @param  Function dialect The dialect instance to set or none the get the setted one.
   * @return Function         The dialect instance or `this` on set.
   */
  dialect(dialect) {
    if (dialect) {
      this._dialect = dialect;
      return this;
    }
    if (!this._dialect) {
      throw new Error(`Missing SQL dialect adapter.`);
    }
    return this._dialect;
  }

  /**
   * Gets/sets data to the statement.
   *
   * @param  String name  The name of the value to set/get.
   * @param  mixed  value The value to set.
   * @return mixed         The setted value.
   */
  data(...args) {
    if (!args.length) {
      throw new Error('Missing name argument.');
    }
    if (args.length === 2) {
      return this._parts[args[0]] = args[1]
    }
    return this._parts[args[0]];
  }

  /**
   * Sets a flag.
   *
   * @param  String  name   The name of the flag to set.
   * @param  Boolean enable The boolean value to set.
   * @return Boolean        The flag value.
   */
  setFlag(flag, enable = true) {
    this._parts.flags.set(flag, !!enable);
    return enable;
  }

  /**
   * Gets a flag.
   *
   * @param  String  name The name of the flag to get.
   * @return Boolean      The flag value.
   */
  getFlag(flag) {
    return this._parts.flags.get(flag);
  }

  /**
   * Adds some where conditions to the query
   *
   * @param  String|Array conditions The conditions for this query.
   * @return Object                   Returns `this`.
   */
  where(conditions) {
    if (!conditions) {
      return this;
    }
    const args = Array.isArray(conditions) ? conditions : [conditions];
    if (args.length) {
      this._parts.where.push(args);
    }
    return this;
  }

  /**
   * Adds additional queries to be executed as named common table expressions
   *
   * @param {Object} queries an object mapping a names to queries
   * @return Object                   Returns `this`.
   */
  with(queries) {
    if (!queries) {
      return this;
    }

    for (const name of Object.keys(queries)) {
      if (this._parts.with.has(name)) {
        const error = new Error(
          `Common table expression ${name} specified more than once`
        );
        throw error;
      }
      this._parts.with.set(name, queries[name]);
    }
    return this;
  }

  /**
   * Adds some order by fields to the query
   *
   * @param  String|Array fields The fields.
   * @return Object              Returns `this`.
   */
  order(...fields) {
    if (!fields.length || !fields[0]) {
      return this;
    }

    const map = this._order(Array.isArray(fields[0]) ? fields[0] : fields);
    for (const [column, dir] of map.entries()) {
      this._parts.order.set(column, dir);
    }
    return this;
  }

  /**
   * Adds a limit statement to the query
   *
   * @param  integer  limit  The limit value.
   * @param  integer  offset The offset value.
   * @return Function        Returns `this`.
   */
  limit(limit, offset) {
    if (!limit) {
      return this;
    }

    this._parts.limit = offset
      ? String(limit) + ' OFFSET ' + String(offset)
      : String(limit);
    return this;
  }

  /**
   * Order formatter helper method
   *
   * @param  Array  fields The fields.
   * @return Map           The fields map.
   */
  _order(fields) {
    const result = new Map();

    for (const value of fields) {
      if (value && value.constructor === Object) {
        const key = Object.keys(value)[0];
        result.set(key, value[key]);
        continue;
      }
      const matches = value.match(ORDER_DIR_EXP);

      if (matches) {
        result.set(matches[1], matches[2]);
        continue;
      }

      result.set(value, ORDER_DIR_ASC);
    }
    return result;
  }

  /**
   * Builds a clause.
   *
   * @param  String clause     The clause name.
   * @param  String expression The expression.
   * @return String            The clause.
   */
  _buildClause(clause, expression) {
    return expression ? ' ' + clause + ' ' + expression : '';
  }

  /**
   * Builds Flags.
   *
   * @param  Map    flags  The flags map.
   * @return String        The formatted flags.
   */
  _buildFlags(flags) {
    const enabled = [];
    for (const [flag, value] of flags.entries()) {
      if (value) {
        enabled.push(flag);
      }
    }
    return enabled.length ? ' ' + enabled.join(' ') : '';
  }

  /**
   * Builds a Flag chunk.
   *
   * @param  String  flag  The flag name.
   * @param  Boolean value The value.
   * @return String        The SQL flag.
   */
  _buildFlag(flag, value) {
    return value ? ' ' + flag : '';
  }

  /**
   * Builds a SQL chunk.
   *
   * @param  String sql The SQL string.
   * @return String     The SQL chunk.
   */
  _buildChunk(sql) {
    return sql ? ' ' + sql : '';
  }

  /**
   * Builds the `ORDER BY` clause.
   *
   * @return String The `ORDER BY` clause.
   */
  _buildOrder(aliases) {
    const result = [];
    const orderby = this._parts.order;
    const dialect = this.dialect();

    for(const [column, dir] of orderby.entries()){
      result.push(dialect.name(column, aliases) + ' ' + dir);
    }

    return this._buildClause('ORDER BY', result.join(', '));
  }

  _buildCTE() {
    if (!this._parts.with.size) {
      return '';
    }
    const queries = [];
    for (const [name, query] of this._parts.with.entries()) {
      queries.push(
        `${name} AS (${query.toString()})`
      );
    }
    return this._buildClause('WITH', queries.join(', ')).trim() + ' ';
  }

}

module.exports = Statement;
