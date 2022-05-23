const Sequelize = require("sequelize");
const { VoteDB } = require("../util/database");
exports.StartPolling = StartPolling;
exports.BackupPolling = BackupPolling;
function StartPolling(Token, TimeSchema, OtherSchema) {
    p = new Promise(function (resolve) {
        dict = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        };
        for (let t of TimeSchema) {
            dict[t] = {
                type: Sequelize.STRING,
                defaultValue: "x",
            };
        }
        if (OtherSchema.length) {
            for (let o of OtherSchema) {
                dict[o] = {
                    type: Sequelize.STRING,
                    defaultValue: "x",
                };
            }
        }

        polling = VoteDB.define(Token, dict, {
            timestamps: false,
            tableName: Token,
        });
        VoteDB.sync({ force: false })
            .then((result) => {
                resolve(polling);
            })
            .catch((err) => {
                console.log(err);
            });
    });
    return p;
}

function BackupPolling(key, TimeSchema, OtherSchema) {
    p = new Promise((resolve) => {
        let dict = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        };
        for (t of TimeSchema) {
            dict[t] = {
                type: Sequelize.STRING,
                defaultValue: "x",
            };
        }
        for (o of OtherSchema) {
            dict[o] = {
                type: Sequelize.STRING,
                defaultValue: "x",
            };
        }

        polling = VoteDB.define(key, dict, {
            timestamps: false,
            tableName: key,
        });
        resolve(polling);
    });
    return p;
}
