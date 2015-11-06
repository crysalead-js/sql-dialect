import { Sqlite } from '../../../..';

describe("Sqlite Insert", function() {

  beforeEach(function() {
    this.dialect = new Sqlite();
    this.insert = this.dialect.statement('insert');
  });

  describe(".orAbort()", function() {

    it("sets the `OR ABORT` flag", function() {

      this.insert
        .orAbort()
        .into('table')
        .values({ field: 'value' });

      expect(this.insert.toString()).toBe('INSERT OR ABORT INTO "table" ("field") VALUES (\'value\')');

    });

  });

  describe(".orFail()", function() {

    it("sets the `OR FAIL` flag", function() {

      this.insert
        .orFail()
        .into('table')
        .values({ field: 'value' });

      expect(this.insert.toString()).toBe('INSERT OR FAIL INTO "table" ("field") VALUES (\'value\')');

    });

  });

  describe(".orIgnore()", function() {

    it("sets the `OR IGNORE` flag", function() {

      this.insert
        .orIgnore()
        .into('table')
        .values({ field: 'value' });

      expect(this.insert.toString()).toBe('INSERT OR IGNORE INTO "table" ("field") VALUES (\'value\')');

    });

  });

  describe(".orReplace()", function() {

    it("sets the `OR REPLACE` flag", function() {

      this.insert
        .orReplace()
        .into('table')
        .values({ field: 'value' });

      expect(this.insert.toString()).toBe('INSERT OR REPLACE INTO "table" ("field") VALUES (\'value\')');

    });

  });

  describe(".orRollback()", function() {

    it("sets the `OR ROLLBACK` flag", function() {

      this.insert
        .orRollback()
        .into('table')
        .values({ field: 'value' });

      expect(this.insert.toString()).toBe('INSERT OR ROLLBACK INTO "table" ("field") VALUES (\'value\')');

    });

  });

});
