const Sequelize = require("sequelize");
const { VoteDB } = require("../util/database");

const events = VoteDB.define(
    "events",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        TOKEN: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        Title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        TimeSchema: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            get() {
                if (this.getDataValue("TimeSchema") == null) {
                    return [];
                } else {
                    return this.getDataValue("TimeSchema").split(";");
                }
            },
            set(val) {
                this.setDataValue("TimeSchema", val.join(";"));
            },
        },
        OtherTopic: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        OtherSchema: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            get() {
                if (this.getDataValue("OtherSchema") == null) {
                    return [];
                } else {
                    return this.getDataValue("OtherSchema").split(";");
                }
            },
            set(val) {
                this.setDataValue("OtherSchema", val.join(";"));
            },
        },
    },
    { timestamps: false }
);
function createEvent(Token, Title, TimeSchema, OtherTopic, OtherSchema) {
    events.create({
        TOKEN: Token,
        Title: Title,
        TimeSchema: TimeSchema,
        OtherTopic: OtherTopic,
        OtherSchema: OtherSchema,
    });
}

exports.events = events;
exports.createEvent = createEvent;
