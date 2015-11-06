import Statement from '../statement';

/**
 * `SELECT` statement.
 */
class Select extends Statement {
  /**
   * Constructor.
   *
   * @param Object config The config array.
   */
  constructor(config) {
    super(config);

    /**
     * Subquery alias
     */
    this._alias = undefined;

    /**
     * The SQL parts.
     *
     * @var Object
     */
    this._parts = {
      flags    : new Map(),
      fields   : [],
      from     : [],
      joins    : [],
      where    : [],
      group    : new Map(),
      having   : [],
      order    : new Map(),
      limit    : '',
      forUpdate: false
    }

  }

  /**
   * Sets `DISTINCT` flag.
   *
   * @param  Boolean  enable A boolan value.
   * @return Function          Returns `this`.
   */
  distinct(enable = true) {
    var enable = enable === undefined ? true : enable;
    this.setFlag('DISTINCT', enable);
    return this;
  }

  /**
   * Adds some fields to the query.
   *
   * @param  Array    fields The fields.
   * @return Function        Returns `this`.
   */
  fields(fields) {
    var fields = Array.isArray(fields) && arguments.length === 1 ? fields : Array.prototype.slice.call(arguments);
    if (fields.length) {
      this._parts.fields = this._parts.fields.concat(fields);
    }
    return this;
  }

  /**
   * Adds some tables in the from statement.
   *
   * @param  Array    source The source or sources tables.
   * @return Function        Returns `this`.
   */
  from(source) {
    if (!source) {
      throw new Error("A `FROM` clause requires a non empty table.");
    }
    var sources = Array.isArray(source) ? source : Array.prototype.slice.call(arguments);
    this._parts.from = this._parts.from.concat(sources);
    return this;
  }

  /**
   * Adds a join to the query.
   *
   * @param  String   join A table name.
   * @param  Object   on   The `ON` conditions.
   * @param  Object   type The type of join (default: `'LEFT'`).
   * @return Function      Returns `this`.
   */
  join(join, on, type) {
    if (!join) {
      return this;
    }
    var on = on === undefined ? [] : on;
    var type = type === undefined ? 'LEFT' : type.toUpperCase();
    this._parts.joins.push({ join: join, on: Array.isArray(on) ? on : [on], type: type });
    return this;
  }

  /**
   * Adds some where conditions to the query.
   *
   * @param  Array    conditions The conditions for this query.
   * @return Function            Returns `this`.
   */
  where(conditions) {
    var conditions = Array.isArray(conditions) && arguments.length === 1 ? conditions : Array.prototype.slice.call(arguments);
    if (conditions.length) {
      this._parts.where.push(conditions);
    }
    return this;
  }

  /**
   * Adds some group by fields to the query.
   *
   * @param  Array    fields The fields.
   * @return Function        Returns `this`.
   */
  group(fields) {
    if (!fields) {
      return this;
    }
    var fields = Array.isArray(fields) && arguments.length === 1 ? fields : Array.prototype.slice.call(arguments);
    for (var field of fields) {
      this._parts.group.set(field, true);
    }
    return this;
  }

  /**
   * Adds some having conditions to the query
   *
   * @param  Array    conditions The havings for this query.
   * @return Function            Returns `this`.
   */
  having(conditions) {
    var conditions = Array.isArray(conditions) && arguments.length === 1 ? conditions : Array.prototype.slice.call(arguments);
    if (conditions.length) {
      this._parts.having.push(conditions);
    }
    return this;
  }

  /**
   * Sets `FOR UPDATE` mode.
   *
   * @param  Boolean  forUpdate The `FOR UPDATE` value.
   * @return Function           Returns `this`.
   */
  forUpdate(forUpdate) {
    var forUpdate = forUpdate === undefined ? true : forUpdate;
    this._parts.forUpdate = forUpdate;
    return this;
  }

  /**
   * If called with a valid alias, the generated select statement
   * will be generated as a subquery.
   *
   * @param  String   alias The alias to use for a subquery.
   * @return String         Returns the alias or `this` on set.
   */
  alias(alias) {
    if (!arguments.length) {
      return this._alias;
    }
    this._alias = alias;
    return this;
  }

  /**
   * Render the SQL statement
   *
   * @return String The generated SQL string.
   */
  toString() {
    var fields = this.dialect().names(this._parts.fields);
    var sql = 'SELECT' +
      this._buildFlags(this._parts.flags) +
      this._buildChunk(fields ? fields : '*') +
      this._buildClause('FROM', this.dialect().names(this._parts.from)) +
      this._buildJoins() +
      this._buildClause('WHERE', this.dialect().conditions(this._parts.where)) +
      this._buildClause('GROUP BY', this._buildGroup()) +
      this._buildClause('HAVING', this.dialect().conditions(this._parts.having)) +
      this._buildOrder() +
      this._buildClause('LIMIT', this._parts.limit) +
      this._buildFlag('FOR UPDATE', this._parts.forUpdate);

    return this._alias ? '(' + sql + ') AS ' + this.dialect().name(this._alias) : sql;
  }

  /**
   * Build the `GROUP BY` clause.
   *
   * @return string The `GROUP BY` clause.
   */
  _buildGroup() {
    var result = [];
    this._parts.group.forEach (function(value, name) {
      result.push(this.dialect().name(name));
    }.bind(this));
    return result.join(', ');
  }

  /**
   * Build the `JOIN` clause.
   *
   * @return string The `JOIN` clause.
   */
  _buildJoins() {
    var joins = [];
    for (var value of this._parts.joins) {
      var table = value.join;
      var on = value.on;
      var type = value.type;
      var join = [type, 'JOIN'];
      join.push(this.dialect().name(table, true));

      if (on.length) {
        join.push('ON');
        join.push(this.dialect().conditions(on));
      }

      joins.push(join.join(' '));
    }
    return joins.length ? ' ' + joins.join(' ') : '';
  }

}

export default Select;
