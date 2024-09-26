const Sequelize = require("sequelize");

const TetrDB = new Sequelize("tetrisdb", "avnadmin", "AVNS_bu0sJD77n1ntBhhSe6b", {
    dialect: "mysql",
    host: "mysql-3fb6ee1-engtsai1450-21fb.g.aivencloud.com",
    port: '24633',
    logging: false,
    query: { raw: true },
});
const VoteDB = new Sequelize("votedb", "avnadmin", "AVNS_bu0sJD77n1ntBhhSe6b", {
    dialect: "mysql",
    host: "mysql-3fb6ee1-engtsai1450-21fb.g.aivencloud.com",
    port: '24633',
    logging: false,
});
const QuestDB = new Sequelize("questdb", "avnadmin", "AVNS_bu0sJD77n1ntBhhSe6b", {
    dialect: "mysql",
    host: "mysql-3fb6ee1-engtsai1450-21fb.g.aivencloud.com",
    port: '24633',
    logging: false,
});
exports.TetrDB = TetrDB;
exports.VoteDB = VoteDB;
exports.QuestDB = QuestDB;
