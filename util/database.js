const Sequelize = require("sequelize");

const TetrDB = new Sequelize("tetrisdb", "user", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
    query: { raw: true },
});
const VoteDB = new Sequelize("votedb", "user", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});
const QuestDB = new Sequelize("questdb", "user", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});
exports.TetrDB = TetrDB;
exports.VoteDB = VoteDB;
exports.QuestDB = QuestDB;
