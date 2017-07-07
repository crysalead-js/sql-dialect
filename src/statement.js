var extend = require('extend-merge').extend;
var merge = require('extend-merge').merge;

class Statement {

  /**
   * Constructor
   *
   * @param Object config The config object. The option is:
   *                       - 'dialect' `object` a dialect adapter.
   */
  constructor(config) {
    var defaults = { dialect: null };

    config = extend({}, defaults, config);

    /**
     * Pointer to the dialect adapter.
     *
     * @var Function
     */
    this._dialect = config['dialect'];

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags: new Map(),
      where: [],
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
    if (arguments.length) {
      this._dialect = dialect;
      return this;
    }
    if (!this._dialect) {
      throw new Error('Missing SQL dialect adapter.');
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
  data(name, value) {
    if (!arguments.length) {
      throw new Error('Missing name argument.');
    }
    if (arguments.length === 2) {
      return this._parts[name] = value;
    }
    return this._parts[name];
  }

  /**
   * Sets a flag.
   *
   * @param  String  name   The name of the flag to set.
   * @param  Boolean enable The boolean value to set.
   * @return Boolean        The flag value.
   */
  setFlag(flag, enable) {
    var enable = enable !== undefined ? enable : true;
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
    var conditions = Array.isArray(conditions) && arguments.length === 1 ? conditions : Array.prototype.slice.call(arguments);
    if (conditions.length) {
      this._parts.where.push(conditions);
    }
    return this;
  }

  /**
   * Adds some order by fields to the query
   *
   * @param  String|Array fields The fields.
   * @return Object              Returns `this`.
   */
  order(fields) {
    if (!fields) {
      return this;
    }
    var fields = Array.isArray(fields) && arguments.length === 1 ? fields : Array.prototype.slice.call(arguments);
    var map = this._order(fields);
    map.forEach(function(dir, column) {
      this._parts.order.set(column, dir);
    }.bind(this));
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
    var limit = offset ? String(limit) + ' OFFSET ' + String(offset) : String(limit);
    this._parts.limit = limit;
    return this;
  }

  /**
   * Order formatter helper method
   *
   * @param  Array  fields The fields.
   * @return Map           The fields map.
   */
  _order(fields) {
    var direction = 'ASC';

    var result = new Map();
    var len = fields.length;

    for (var i = 0; i < len; i++) {
      var value = fields[i];
      if (value && value.constructor === Object) {
        var key = Object.keys(value)[0];
        result.set(key, value[key]);
        continue;
      }
      var matches = value.match(/^(.*?)\s+((?:a|de)sc)/i);
      var dir;
      if (matches) {
        value = matches[1];
        dir = matches[2];
      } else {
        dir = direction;
      }
      result.set(value, dir);
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
    var key;
    var enabled = [];
    flags.forEach(function(value, flag) {
      if (value) {
        enabled.push(flag);
      }
    });
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
    var result = [];
    this._parts.order.forEach(function(dir, column) {
      result.push(this.dialect().name(column, aliases) + ' ' + dir);
    }.bind(this));
    return this._buildClause('ORDER BY', result.join(', '));
  }

}

module.exports = Statement;
