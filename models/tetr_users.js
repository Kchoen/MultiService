const Sequelize = require("sequelize");
const { TetrDB } = require("../util/database");

const users = TetrDB.define(
    "users",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        UID: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        PW: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        NAME: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        PIC: {
            type: Sequelize.BLOB("long"),
        },
        elo: {
            type: Sequelize.FLOAT,
            defaultValue: 1000,
        },
    },
    { timestamps: false }
);

module.exports = users;
