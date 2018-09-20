require('./statement.spec');
require('./dialect.spec');
require('./statement/select.spec');
require('./statement/insert.spec');
require('./statement/update.spec');
require('./statement/delete.spec');
require('./statement/truncate.spec');
require('./statement/drop-table.spec');

require('./statement/mysql/dialect.spec');
require('./statement/mysql/create-table.spec');
require('./statement/mysql/select.spec');
require('./statement/mysql/insert.spec');
require('./statement/mysql/update.spec');
require('./statement/mysql/delete.spec');

require('./statement/postgresql/dialect.spec');
require('./statement/postgresql/create-table.spec');
require('./statement/postgresql/select.spec');
require('./statement/postgresql/insert.spec');
require('./statement/postgresql/update.spec');
require('./statement/postgresql/delete.spec');

require('./statement/sqlite/dialect.spec');
require('./statement/sqlite/create-table.spec');
require('./statement/sqlite/insert.spec');
require('./statement/sqlite/update.spec');
require('./statement/sqlite/truncate.spec');