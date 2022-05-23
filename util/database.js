const Sequelize = require("sequelize");

const TetrDB = new Sequelize("tetrisdb", "root", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
    query: { raw: true },
});
const VoteDB = new Sequelize("votedb", "root", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});
const QuestDB = new Sequelize("questdb", "root", "password", {
    dialect: "mysql",
    host: "localhost",
    logging: false,
});
exports.TetrDB = TetrDB;
exports.VoteDB = VoteDB;
exports.QuestDB = QuestDB;
