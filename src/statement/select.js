'use strict'

const Statement = require('../statement');

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
      with     : new Map(),
      group    : new Map(),
      having   : [],
      order    : new Map(),
      limit    : '',
      lock     : null,
      noWait   : false
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
  fields(...fields) {
    if (fields.length) {
      this._parts.fields.push(...toArray(fields));
    }
    return this;
  }

  /**
   * Adds some tables in the from statement.
   *
   * @param  Array    source The source or sources tables.
   * @return Function        Returns `this`.
   */
  from(...source) {
    const tables = source.filter(Boolean)
    if (!tables.length) {
      throw new Error('A `FROM` clause requires a non empty table.');
    }
    this._parts.from.push(...tables);
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
    if (conditions) {
      this._parts.where.push(...toArray(conditions));
    }
    return this;
  }

  /**
   * Adds some group by fields to the query.
   *
   * @param  Array    fields The fields.
   * @return Function        Returns `this`.
   */
  group(...fields) {
    if (!fields.length) {
      return this;
    }
    const args = toArray(fields);
    for (const field of args) {
      if (!field) {
        continue;
      }
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
  having(...conditions) {
    if (conditions.length) {
      this._parts.having.push(conditions);
    }
    return this;
  }

  /**
   * Set the lock mode.
   *
   * @param  Boolean mode The lock mode.
   * @return self         Returns `this`.
   */
  lock(mode) {
    return this;
  }

  /**
   * Set the `NOWAIT` mode.
   *
   * @param  Boolean noWait The `NOWAIT` mode.
   * @return self           Returns `this`.
   */
  noWait(noWait = true) {
    this._parts.noWait = noWait;
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
   * @TODO There are a lot of empty strings we don't need to do anything with
   *       This results in a lot of string concatns the don't need to happen
   */
  toString(schemas = [], aliases) {
    const dialect = this.dialect()
    const fields = dialect.names(this._parts.fields);
    const opts = { schemas: schemas, aliases: aliases }
    var sql = this._buildCTE() +
      'SELECT' +
      this._buildFlags(this._parts.flags) +
      this._buildChunk(fields ? fields : '*') +
      this._buildClause('FROM', dialect.names(this._parts.from)) +
      this._buildJoins(schemas, aliases) +
      this._buildClause('WHERE', dialect.conditions(this._parts.where, opts)) +
      this._buildClause('GROUP BY', this._buildGroup()) +
      this._buildClause('HAVING', dialect.conditions(this._parts.having, opts)) +
      this._buildOrder(aliases) +
      this._buildClause('LIMIT', this._parts.limit);

    if (this._parts.lock) {
      sql += this._buildFlag(this._parts.lock, this._parts.lock) +
        this._buildFlag('NOWAIT', this._parts.noWait);
    }

    return this._alias ? '(' + sql + ') AS ' + dialect.name(this._alias) : sql;
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
  _buildJoins(schemas, aliases) {
    const joins = [];
    const dialect = this.dialect()
    for (const value of this._parts.joins) {
      const table = value.join;
      const on = value.on;
      const type = value.type;
      const join = [type, 'JOIN'];
      join.push(dialect.name(table));

      if (on.length) {
        join.push('ON');
        join.push(dialect.conditions(on, { schemas: schemas, aliases: aliases }));
      }

      joins.push(join.join(' '));
    }
    return joins.length ? ' ' + joins.join(' ') : '';
  }

}

function toArray(item) {
  if (!item) return []
  if (Array.isArray(item)) {
    if (Array.isArray(item[0])) return item[0]
    return item
  }
  return [item]
}

module.exports = Select;
