import { Sqlite } from '../../../../src';

describe("Sqlite Update", function() {

  beforeEach(function() {
    this.dialect = new Sqlite();
    this.update = this.dialect.statement('update');
  });

  describe(".orAbort()", function() {

    it("sets the `OR ABORT` flag", function() {

      this.update
        .orAbort()
        .table('table')
        .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE OR ABORT "table" SET "field" = \'value\'');

    });

  });

  describe(".orFail()", function() {

    it("sets the `OR FAIL` flag", function() {

      this.update
        .orFail()
        .table('table')
        .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE OR FAIL "table" SET "field" = \'value\'');

    });

  });

  describe(".orIgnore()", function() {

    it("sets the `OR IGNORE` flag", function() {

      this.update
        .orIgnore()
        .table('table')
        .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE OR IGNORE "table" SET "field" = \'value\'');

    });

  });

  describe(".orReplace()", function() {

    it("sets the `OR REPLACE` flag", function() {

      this.update
        .orReplace()
        .table('table')
        .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE OR REPLACE "table" SET "field" = \'value\'');

    });

  });

  describe(".orRollback()", function() {

    it("sets the `OR ROLLBACK` flag", function() {

      this.update
        .orRollback()
        .table('table')
        .values({ field: 'value' });

      expect(this.update.toString()).toBe('UPDATE OR ROLLBACK "table" SET "field" = \'value\'');

    });

  });

});
