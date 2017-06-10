var MySql = require('../../../../src/dialect/my-sql');

describe("MySql Select", function() {

  beforeEach(function() {
    this.dialect = new MySql();
    this.select = this.dialect.statement('select');
  });

  describe(".lock()", function() {

    it("sets the `FOR UPDATE` flag", function() {

      this.select.from('table')
        .lock('update')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT `firstname` FROM `table` FOR UPDATE');

    });

    it("sets the `LOCK IN SHARE MODE", function() {

      this.select.from('table')
        .lock('share')
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT `firstname` FROM `table` LOCK IN SHARE MODE');

    });

    it("throws an `SQLException` for invalid lock mode", function() {

      var select = this.select;

      var closure = function() {
        select.from('table')
          .lock('invalid')
          .fields('firstname');
      };
      expect(closure).toThrow(new Error("Invalid MySQL lock mode `'invalid'`."));

    });

  });

  describe(".noWait()", function() {

    it("set the `NOWAIT` flag", function() {

      this.select.from('table')
        .lock('update')
        .noWait()
        .fields('firstname');
      expect(this.select.toString()).toBe('SELECT `firstname` FROM `table` FOR UPDATE NOWAIT');

    });

  });

  describe(".calcFoundRows()", function() {

    it("sets the `SQL_CALC_FOUND_ROWS` flag", function() {

      this.select.calcFoundRows().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_CALC_FOUND_ROWS * FROM `table`');

    });

  });

  describe(".cache()", function() {

    it("sets the `SQL_CACHE` flag", function() {

      this.select.cache().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_CACHE * FROM `table`');

    });

  });

  describe(".noCache()", function() {

    it("sets the `SQL_NO_CACHE` flag", function() {

      this.select.noCache().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_NO_CACHE * FROM `table`');

    });

  });

  describe(".straightJoin()", function() {

    it("sets the `STRAIGHT_JOIN` flag", function() {

      this.select.straightJoin().from('table');
      expect(this.select.toString()).toBe('SELECT STRAIGHT_JOIN * FROM `table`');

    });

  });

  describe(".highPriority()", function() {

    it("sets the `HIGH_PRIORITY` flag", function() {

      this.select.highPriority().from('table');
      expect(this.select.toString()).toBe('SELECT HIGH_PRIORITY * FROM `table`');

    });

  });

  describe(".smallResult()", function() {

    it("sets the `SQL_SMALL_RESULT` flag", function() {

      this.select.smallResult().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_SMALL_RESULT * FROM `table`');

    });

  });

  describe(".bigResult()", function() {

    it("sets the `SQL_BIG_RESULT` flag", function() {

      this.select.bigResult().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_BIG_RESULT * FROM `table`');

    });

  });

  describe(".bufferResult()", function() {

    it("sets the `SQL_BUFFER_RESULT` flag", function() {

      this.select.bufferResult().from('table');
      expect(this.select.toString()).toBe('SELECT SQL_BUFFER_RESULT * FROM `table`');

    });

  });

});
