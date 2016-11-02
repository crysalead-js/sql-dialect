import { MySql } from '../../../../src';

describe("MySql Delete", function() {

  beforeEach(function() {
    this.dialect = new MySql();
    this.delete = this.dialect.statement('delete');
  });

  describe(".lowPriority()", function() {

    it("sets the `LOW_PRIORITY` flag", function() {

      this.delete.lowPriority().from('table');
      expect(this.delete.toString()).toBe('DELETE LOW_PRIORITY FROM `table`');

    });

  });

  describe(".ignore()", function() {

    it("sets the `IGNORE` flag", function() {

      this.delete.ignore().from('table');
      expect(this.delete.toString()).toBe('DELETE IGNORE FROM `table`');

    });

  });

  describe(".quick()", function() {

    it("sets the `QUICK` flag", function() {

      this.delete.quick().from('table');
      expect(this.delete.toString()).toBe('DELETE QUICK FROM `table`');

    });

  });

});