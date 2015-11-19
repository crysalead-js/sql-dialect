import {extend, merge} from 'extend-merge';
import string from 'string-placeholder';

import Select from './statement/select';
import Insert from './statement/insert';
import Update from './statement/update';
import Delete from './statement/delete';
import CreateTable from './statement/create-table';
import DropTable from './statement/drop-table';

/**
 * ANSI SQL dialect
 */
class Dialect {

  /**
   * Gets/sets classes dependencies.
   *
   * @param  Object classes The classes dependencies to set or none to get it.
   * @return mixed          The classes dependencies.
   */
  static classes(classes) {
    if (arguments.length) {
      this._classes = merge({}, this._classes, classes);
    }
    return this._classes;
  }

  /**
   * Constructor
   *
   * @param array config The config array
   */
  constructor(config) {
    var defaults = {
      'classes': this.constructor.classes(),
      'quoter': null,
      'caster': null,
      'types': {},
      'operators': this._defaultOperators(),
      'builders': this._defaultBuilders(),
      'formatters': this._defaultFormatters(),
      'dateFormat': 'Y-m-d H:i:s'
    };

    config = merge({}, defaults, config);

    /**
     * Class dependencies.
     *
     * @var array
     */
    this._classes = config.classes;

    /**
     * Quoting identifier character.
     *
     * @var string
     */
    this._escape = '"';

    /**
     * Quoter handler.
     *
     * @var Function
     */
    this._quoter = config.quoter;

    /**
     * Casting handler.
     *
     * @var Function
     */
    this._caster = config.caster;

    /**
     * Date format.
     *
     * @var String
     */
    this._dateFormat = config.dateFormat;

    /**
     * Column type definitions.
     *
     * @var Object
     */
    this._types = config.types;

    /**
     * Operator builders
     *
     * @var Object
     */
    this._builders = config.builders;

    /**
     * List of formatter operators
     *
     * @var Object
     */
    this._formatters = config.formatters;

        /**
     * List of SQL operators, paired with handling options.
     *
     * @var Object
     */
    this._operators = config.operators;

    /**
     * Type mapping.
     *
     * @var Object
     */
     this._maps = {};

    /**
     * Meta attribute syntax pattern.
     *
     * @var Object
     */
     this._meta = {};
  }

  /**
   * Return default supported operators
   *
   * @return Object
   */
  _defaultOperators() {
    return {
      '='            : { 'null': ':is' },
      '<=>'          : { },
      '<'            : { },
      '>'            : { },
      '<='           : { },
      '>='           : { },
      '!='           : { 'null': ':is not' },
      '<>'           : { },
      '-'            : { },
      '+'            : { },
      '*'            : { },
      '/'            : { },
      '%'            : { },
      '>>'           : { },
      '<<'           : { },
      ':='           : { },
      '&'            : { },
      '|'            : { },
      ':mod'         : { },
      ':div'         : { },
      ':like'        : { },
      ':not like'    : { },
      ':is'          : { },
      ':is not'      : { },
      ':distinct'    : { builder: 'prefix' },
      '~'            : { builder: 'prefix' },
      ':between'     : { builder: 'between' },
      ':not between' : { builder: 'between' },
      ':in'          : { builder: 'list' },
      ':not in'      : { builder: 'list' },
      ':exists'      : { builder: 'list' },
      ':not exists'  : { builder: 'list' },
      ':all'         : { builder: 'list' },
      ':any'         : { builder: 'list' },
      ':some'        : { builder: 'list' },
      ':as'          : { builder: 'alias' },
      // logical operators
      ':not'         : { builder: 'prefix' },
      ':and'         : { },
      ':or'          : { },
      ':xor'         : { },
      '()'           : { format: '(%s)' }
    }
  }

  /**
   * Return default operator builders
   *
   * @return Object
   */
  _defaultBuilders() {
    return {
      'function': function (operator, parts) {
        var operator = operator.substr(0, operator.length - 2).toUpperCase();
        return operator + '(' + parts.join(', ') + ')';
      },
      'prefix': function (operator, parts) {
        return operator + ' ' + parts.shift();
      },
      'list': function (operator, parts) {
        var key = parts.shift();
        return key + ' ' + operator + ' (' + parts.join(', ') + ')';
      },
      'between': function (operator, parts) {
        var key = parts.shift();
        return key + ' ' + operator + ' ' + parts[0] + ' AND ' + parts[parts.length - 1];
      },
      'set': function (operator, parts) {
        return parts.join(' ' + operator + ' ');
      },
      'alias': function (operator, parts) {
        var expr = parts.shift();
        return '(' + expr + ') ' + operator + ' ' + parts.shift();
      }
    };
  }

  /**
   * Return default formatters.
   *
   * @return Object
   */
  _defaultFormatters() {
    return {
      ':name': function (value, states) {
        return this.name(value);
      }.bind(this),
      ':value': function (value, states) {
        return this.value(value, states);
      }.bind(this),
      ':plain': function (value, states) {
        return String(value);
      }.bind(this)
    };
  }

  /**
   * Gets/sets the quoter handler
   *
   * @param  Function quoter The quoter handler or nothing to get the current one.
   * @return Function        Returns the quoter handler.
   */
  quoter(quoter) {
    if (arguments.length) {
      this._quoter = quoter;
    }
    return this._quoter;
  }

  /**
   * Gets/sets the casting handler
   *
   * @param  Function caster The casting handler or nothing to get the current one.
   * @return Function        Returns the casting handler.
   */
  caster(caster) {
    if (arguments.length) {
      this._caster = caster;
    }
    return this._caster;
  }

  /**
   * Gets/sets an internal type definition
   *
   * @param  String type   The type name.
   * @param  Object config The type definition.
   * @return Object        Return the type definition.
   */
  type(type, config) {
    if (config) {
      this._types[type] = config;
    }
    if (this._types[type] === undefined) {
      throw new Error("Column type `'" + type + "'` does not exist.");
    }
    return this._types[type];
  }

  /**
   * Sets a type mapping.
   *
   * @param  String   type    The type name.
   * @param  Object   options The type definition.
   * @return Function         Return `this`.
   */
  map(use, type, options) {
    if (this._maps[use] === undefined) {
      this._maps[use] = {};
    }
    var defaults = {};
    defaults[type] = options ? options : {};
    this._maps[use] = extend({}, defaults, this._maps[use]);
    return this;
  }

  /**
   * Gets a mapped type.
   *
   * @param  Object column The column definition or the database type.
   * @return Object        Return the mapped column definition.
   */
  mapped(column) {
    var options, use;
    if (typeof column === 'object') {
      options = extend({}, column);
      use = options.use;
      delete options.use;
    } else {
      use = column;
      options = {};
    }

    if (this._maps[use] === undefined) {
      throw new Error("No type matching has been defined for `'" + use + "'`.");
    }

    var result, cpt, max = 0;

    for (var type in this._maps[use]) {
      var value = this._maps[use][type];
      cpt = 0;
      for (var key in value) {
        cpt = value[key] === options[key] ? cpt + 1 : cpt - 1;
      }
      if (cpt >= max) {
        result = type;
        max = cpt;
      }
    }

    if (result) {
      return result;
    }
    throw new Error("No type matching has been defined for `'" + use + "'`.");
  }

  /**
   * Formats a field definition
   *
   * @param  Object field   A partial field definition.
   * @return Object          A complete field definition.
   */
  field(field) {
    if (field.name === undefined) {
      throw new Error("Missing column name.");
    }
    if (field.type) {
      field = extend({}, this.type(field.type), field);
    } else if (field.use === undefined) {
      field = extend({}, this.type('string'), field);
    }
    return extend({
      'name'     : null,
      'type'     : null,
      'length'   : null,
      'precision': null,
      'serial'   : false,
      'default'  : null,
      'null'     : null
    }, field);
  }

  /**
   * SQL Statement factory
   *
   * @param  String   name   The name of the statement to instantiate.
   * @param  Object   config The configuration options.
   * @return Function        A statement instance.
   */
  statement(name, config) {
    var defaults = { 'dialect': this };
    config = extend({}, defaults, config);

    if (this._classes[name] === undefined) {
      throw new Error("Unsupported statement `'" + name + "'`.");
    }
    var statement = this._classes[name];
    return new statement(config);
  }

  /**
   * Generates a list of escaped table/field names identifier.
   *
   * @param  Array  fields The fields to format.
   * @return String        The formatted fields.
   */
  names(fields) {
    return Array.from(this.escapes(fields, '').values()).join(', ');
  }

  /**
   * Escapes a list of identifers.
   *
   * Note: it ignores duplicates.
   *
   * @param  String|Array names  A name or an array of names to escapes.
   * @param  String       prefix An optionnal table/alias prefix to use.
   * @return Map                 A Map of escaped fields.
   */
  escapes(names, prefix) {
    names = Array.isArray(names) ? names : [names];
    var sql = new Map(), name, key, len, str;
    len = names.length

    for (var i = 0; i < len; i++) {
      var value = names[i];
      if (typeof value === 'string') {
        name = this.name(value);
        name = prefix ? prefix + '.' + name : name;
        sql.set(name, name);
      } else if (Array.isArray(value)) {
        var map = this.escapes(value, prefix);
        map.forEach(function(v, k) {
          sql.set(k, v);
        });
      } else if (value && value.constructor === Object) {
        var key = Object.keys(value)[0];
        if (this.isOperator(key)) {
          str = this.conditions(value);
          sql.set(str, str);
        } else {
          if (Array.isArray(value[key])) {
            var map = this.escapes(value[key], this.escape(key));
            map.forEach(function(v, k) {
              sql.set(k, v);
            });
          } else {
            name = this.name(key);
            value = this.name(value[key]);
            name = name !== value ? name + ' AS ' + value : name;
            name = prefix ? prefix + '.' + name : name;
            sql.set(name, name);
          }
        }
      } else {
        str = value.toString();
        sql.set(str, str);
      }
    }
    return sql;
  }

  /**
   * Prefixes a list of identifers.
   *
   * @param  String|Array names       A name or an array of names to prefix.
   * @param  String       prefix      The prefix to use.
   * @param  boolean      prefixValue Boolean indicating if prefixing must occurs.
   * @return Array                    The prefixed names.
   */
  prefix(names, prefix, prefixValue) {
    if (prefixValue === undefined) {
      prefixValue = true;
    }
    names = Array.isArray(names) ? names : [names];
    var result = [], len;
    len = names.length;

    for (var i = 0; i < len; i++) {
      var field = {};
      var key = i;
      var value = names[i];

      if (value.constructor === Object) {
        var key = Object.keys(value)[0];
        value = value[key];
        if (this.isOperator(key)) {
          if (key === ':name') {
            value = this._prefix(value, prefix);
          } else {
            value = Array.isArray(value) ? this.prefix(value, prefix, false) : value;
          }
        } else {
          key = this._prefix(key, prefix);
        }
        field[key] = value;
        result.push(field);
      } else {
        result.push(prefixValue ? this._prefix(value, prefix) : value);
      }
    }
    return result;
  }

  /**
   * Prefixes a identifer.
   *
   * @param  String names  The name to prefix.
   * @param  String prefix The prefix.
   * @return String        The prefixed name.
   */
  _prefix(name, prefix) {
    var [alias, field] = this.undot(name);
    return alias ? name : prefix + '.' + field;
  }

  /**
   * Returns a string of formatted conditions to be inserted into the query statement. If the
   * query conditions are defined as an array, key pairs are converted to SQL strings.
   *
   * Conversion rules are as follows:
   *
   * - If `key` is numeric and `value` is a string, `value` is treated as a literal SQL
   *   fragment and returned.
   *
   * @param  Object conditions The conditions for this query.
   * @param  Object options    The options. Possible values are:
   *                            - `prepend`  _String_: The string to prepend or `false` for no prefix.
   *                            - `operator` _String_: The join operator.
   *                            - `schemas`  _Object_: The schemas hash object.
   * @return String            Returns an SQL conditions clause.
   */
  conditions(conditions, options) {
    if (!conditions ||
      (Array.isArray(conditions) && !conditions.length) ||
      (typeof conditions === 'object' && !Object.keys(conditions).length)
    ) {
      return '';
    }

    var defaults = {
      'prepend' : false,
      'operator': ':and',
      'schemas' : {},
      'schema'  : undefined,
      'name'    : undefined
    };
    options = extend({}, defaults, options);

    var result = this._operator(options.operator.toLowerCase(), conditions, options);
    return (options.prepend && result) ? options.prepend + ' ' + result : result;
  }

  /**
   * Build a SQL operator statement.
   *
   * @param  String operator   The operator.
   * @param  Array  conditions The data for the operator.
   * @param  Object states     The current states.
   * @return string            Returns a SQL string.
   */
  _operator(operator, conditions, states) {
    var config;

    if (operator.substr(-2) === '()') {
      config = { builder: 'function' };
    } else if (this._operators[operator] !== undefined) {
      config = this._operators[operator];
    } else {
      throw new Error("Unexisting operator `'" + operator + "'`.");
    }

    var conditions = Array.isArray(conditions) ? conditions : [conditions];
    var parts = this._conditions(conditions, states);

    //var operator = (is_array(parts) && next(parts) === null && isset(config['null'])) ? config['null'] : operator;
    var operator = operator.charAt(0) === ':' ? operator.substr(1).toUpperCase() : operator;
    if (config.builder === undefined) {
      return parts.join(' ' + operator + ' ');
    }
    var builder = this._builders[config.builder];
    return builder(operator, parts);
  }

  /**
   * Checks whether a string is an operator or not.
   *
   * @param  String  operator The operator name.
   * @return Boolean          Returns `true` is the passed string is an operator, `false` otherwise.
   */
  isOperator(operator) {
    return (operator && operator.charAt(0) === ':') || this._operators[operator] !== undefined;
  }

  /**
   * Build a formated array of SQL statement.
   *
   * @param  Array  conditions A array of conditions.
   * @param  Object states     The states.
   * @return Array             Returns a array of SQL string.
   */
  _conditions(conditions, states) {
    var parts = [], len;
    len = conditions.length;

    for (var i = 0; i < len; i++) {
      var value = conditions[i];
      if (Array.isArray(value)) {
        parts = parts.concat(this._conditions(value, states));
      } else {
        if (value.constructor !== Object) {
          parts.push(this.value(value, states));
        } else {
          var name = Object.keys(value)[0];
          var key = name.toLowerCase();
          if (this._formatters[key] !== undefined) {
            parts.push(this.format(key, value[name], states));
          } else if (this.isOperator(key)) {
            parts.push(this._operator(key, value[name], states));
          } else {
            parts.push(this._name(name, value[name], states));
          }
        }
      }
    }
    return parts;
  }

  /**
   * Build a <fieldname> = <value> SQL condition.
   *
   * @param  string name   The field name.
   * @param  mixed  value  The data value.
   * @param  Object states The current states.
   * @return string        Returns a SQL string.
   */
  _name(name, value, states) {
    var [alias, field] = this.undot(name);
    var escaped = this.name(name);
    var schema = states.schemas[alias];
    states.name = field;
    states.schema = schema;

    if (!value || value.constructor !== Object && value.constructor !== Array) {
      return escaped + ' = ' + this.value(value, states);
    }

    var key = Object.keys(value)[0];
    var operator = key.toLowerCase();

    if (this._formatters[operator] !== undefined) {
      return escaped + ' = ' + this.format(operator, value[key], states);
    } else if (this._operators[operator] === undefined) {
      return this._operator(':in', [{ ':name': name }, value], states);
    }

    var conditions = value[key];
    conditions = Array.isArray(conditions) ? conditions : [conditions];
    conditions.unshift({ ':name': name });
    return this._operator(operator, conditions, states);
  }

  /**
   * SQL formatter.
   *
   * @param  String operator The format operator.
   * @param  mixed  value    The value to format.
   * @param  Object states   The current states.
   * @return string          Returns a SQL string.
   */
  format(operator, value, states) {
    if (this._formatters[operator] === undefined) {
      throw new Error("Unexisting formatter `'" + operator + "'`.");
    }
    var formatter = this._formatters[operator];
    return formatter(value, states);
  }

  /**
   * Escapes a column/table/schema with dotted syntax support.
   *
   * @param  String name The identifier name.
   * @return String      The escaped identifier.
   */
  name(name) {
    if (typeof name !== 'string') {
      return this.names(name);
    }
    var parts = this.undot(name);
    return parts[0] ? this.escape(parts[0]) + '.' + this.escape(parts[1]) : this.escape(name);
  }

  /**
   * Escapes a column/table/schema name.
   *
   * @param  String name The identifier name.
   * @return String      The escaped identifier.
   */
  escape(name) {
    return name === '*' ? '*' : this._escape + name + this._escape;
  }

  /**
   * Split dotted syntax into distinct name.
   *
   * @param  String field A dotted identifier.
   * @return Array        The parts.
   */
  undot(field) {
    if (typeof field === 'string') {
      var pos = field.indexOf('.');
      if (pos !== -1) {
        return [field.substr(0, pos), field.substr(pos + 1)];
      }
    }
    return [null, field];
  }

  /**
   * Quotes a string.
   *
   * @param  String string The string to quote.
   * @return String        The quoted string.
   */
  quote(string) {
    if (this.quoter()) {
      return this.quoter()(string);
    }
    var str = String(string).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(c) {
      switch (c) {
        case '\0':
          return '\\0';
        case '\x08':
          return '\\b';
        case '\x09':
          return '\\t';
        case '\x1a':
          return '\\z';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '"':
        case '\'':
        case '\\':
        case '%':
          return '\\' + c;
      }
    });
    return "'" + string + "'";
  }

  /**
   * Converts a given value into the proper type based on a given schema definition.
   *
   * @param  mixed  value  The value to be converted. Arrays will be recursively converted.
   * @param  Object states The current states.
   * @return mixed         The formatted value.
   */
  value(value, states) {
    var caster = this.caster()
    if (caster) {
      return caster(value, states);
    }
    switch (true) {
      case typeof value === 'boolean':
        return value ? 'TRUE' : 'FALSE';
      case typeof value === 'string':
        return this.quote(value);
      case Array.isArray(value):
        var cast = function(value) {
          var result = [], len;
          len = value.length
          for (var i = 0; i < len; i++) {
            var v = value[i];
            if (Array.isArray(v)) {
              result.push(cast(v));
            } else {
              result.push(v);
            }
          }
          return '{' + result.join(',') + '}';

        };
        return cast(value);
    }
    return String(value);
  }

  /**
   * Generates a database-native column schema string
   *
   * @param  Object  column A field array structured like the following:
   *                        `{ name: 'value', type: 'value' [, options] }`, where options
   *                        can be `'default'`, `'null'`, `'length'` or `'precision'`.
   * @return String         A SQL string formated column.
   */
  column(field) {
    var field = this.field(field);

    var isNumeric = /^(integer|float|boolean)/.test(field.type);
    if (isNumeric && field['default'] === '') {
      field.null = true;
      field['default'] = null;
    }
    field.use = field.use.toLowerCase();
    return this._column(field);
  }

  /**
   * Formats a column name.
   *
   * @param  String  name      A column name.
   * @param  integer length    A column length.
   * @param  integer precision A column precision.
   * @return String            The formatted column.
   */
  _formatColumn(name, length, precision) {
    var size = [];
    if (length) {
      size.push(length);
    }
    if (precision) {
      size.push(precision);
    }
    return size.length ? name + '(' + size.join(',') + ')' : name;
  }

  /**
   * Builds a column/table meta.
   *
   * @param  String type  The meta type.
   * @param  Object data  The meta data.
   * @param  Object names If `names` is not `null` only build meta present in `names`.
   * @return string       The SQL meta.
   */
  meta(type, data, names) {
    var result = [];
    var items, len;
    if (arguments.length === 3) {
      items = Array.isArray(names) ? names : [names];
    } else {
      items = Object.keys(data);
    }
    len = items.length;
    for (var i = 0; i < len; i++) {
      var name = items[i];
      var value = data[name];
      var meta = this._metadata(type, name, value);
      if (value && meta) {
        result.push(meta);
      }
    }
    return result.join(' ');
  }

  /**
   * Helper for building a column/table single meta string.
   *
   * @param  String type  The type of the meta to build (possible values: 'table' or 'column')
   * @param  String name  The name of the meta to build
   * @param  mixed  value The meta value.
   * @return String       The SQL meta.
   */
  _metadata(type, name, value) {
    var meta = this._meta[type] ? this._meta[type][name] : undefined;
    if (!meta || (meta.options && meta.options.indexOf(value) === -1 )) {
      return;
    }
    meta = extend({}, { keyword: '', escape: false, join: ' ' }, meta);
    var escape = meta.escape;
    var keyword = meta.keyword;
    var join = meta.join;

    if (escape === true) {
      value = this.value(value);
    }
    var result = keyword + join + value;
    return result !== ' ' ? result : '';
  }

  /**
   * Build a SQL column constraint
   *
   * @param  String name       The name of the meta to build.
   * @param  Object constraint The constraint value.
   * @param  Object options    The constraint options.
   * @return String            The SQL meta string.
   */
  constraint(name, constraint, options) {
    constraint = extend({}, { options: [] }, constraint);

    var meta = this._constraints[name];
    var template = meta ? meta.template : undefined;
    if (!template) {
      throw new Error("Invalid constraint template `'" + name + "'`.");
    }

    var data = {};

    for (var name in constraint) {
      var value = constraint[name];

      switch (name) {
        case 'key':
        case 'index':
          if (meta[name] !== undefined) {
            data.index = meta[name];
          }
        break;
        case 'to':
          data[name] = this.name(value);
        break;
        case 'on':
          data[name] = 'ON ' + value;
        break;
        case 'constraint':
          data[name] = 'CONSTRAINT ' + this.name(value);
        break;
        case 'expr':
          data[name] = this.conditions(Array.isArray(value) ? value : [value], options);
        break;
        case 'column':
        case 'primaryKey':
        case 'foreignKey':
          value = Array.isArray(value) ? value : [value];
          value = value.map(function(val) {
            return this.name(val);
          }.bind(this));
          data[name] = value.join(', ');
        break;
      }
    }

    return string(template, data, { clean: true }).trim();
  }
}

/**
 * Class dependencies.
 *
 * @var Object
 */
Dialect._classes = {
  'select'      : Select,
  'insert'      : Insert,
  'update'      : Update,
  'delete'      : Delete,
  'create table': CreateTable,
  'drop table'  : DropTable
};

export default Dialect;